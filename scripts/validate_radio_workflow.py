#!/usr/bin/env python3
"""Validate ScanVista slug-based product workflow using existing account.

This script uses your existing credentials and project to test the full flow:
- Login with your account
- Use existing 'ScanVista' project
- Upload model + image
- Create and publish product with slug 'radio'
- Verify everything works end-to-end
"""

import json
import os
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# ========================== YOUR CREDENTIALS ==========================
# Hardcoded for your private local testing (never push this file to GitHub)
YOUR_EMAIL = "garvj7607@gmail.com"          # ← CHANGE THIS
YOUR_PASSWORD = "Garv@0036"           # ← CHANGE THIS
PROJECT_NAME = "ScanVista"                     # Must exist in your account
PRODUCT_SLUG = "radio"
# =====================================================================

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / 'server' / '.env'

MODEL_ASSET = ROOT_DIR / 'client' / 'public' / 'models' / 'headphone.glb'
IMAGE_ASSET = ROOT_DIR / 'ui' / 'image1.png'

REQUEST_TIMEOUT = 30


def load_environment() -> dict:
    load_dotenv(ENV_PATH)
    env = {
        'API_BASE_URL': os.getenv('API_BASE_URL') or 'http://localhost:5000/api',
        'FRONTEND_BASE_URL': os.getenv('CLIENT_URL') or 'http://localhost:5173',
        'DATABASE_URL': os.getenv('DATABASE_URL'),
    }

    if not env['DATABASE_URL']:
        raise RuntimeError('DATABASE_URL is required in server/.env')

    return env


def request_json(session: requests.Session, method: str, url: str, **kwargs):
    response = session.request(method, url, timeout=REQUEST_TIMEOUT, **kwargs)
    try:
        payload = response.json()
    except ValueError:
        payload = response.text
    if not response.ok:
        raise RuntimeError(f'HTTP {response.status_code} {method} {url} failed: {payload}')
    return payload


def login_user(session: requests.Session, api_base: str, email: str, password: str) -> dict:
    print(f'1/7 Logging in with your account: {email}')
    url = f'{api_base}/auth/login'
    return request_json(session, 'POST', url, json={'email': email, 'password': password})


def get_my_projects(session: requests.Session, api_base: str) -> list:
    url = f'{api_base}/projects/my'
    return request_json(session, 'GET', url)


def ensure_project(session: requests.Session, api_base: str, project_name: str) -> dict:
    projects = get_my_projects(session, api_base)
    for project in projects:
        if project.get('name') == project_name:
            print(f'2/7 Using existing project: {project_name} (id={project.get("id")})')
            return project
    raise RuntimeError(f"Project '{project_name}' not found. Please create it in your dashboard first.")


def upload_asset(session: requests.Session, api_base: str, file_path: Path) -> str:
    if not file_path.exists():
        raise FileNotFoundError(f'Asset not found: {file_path}')

    print(f'3/7 Uploading asset: {file_path.name}')
    url = f'{api_base}/products/upload-asset'
    with file_path.open('rb') as file_obj:
        files = {'file': (file_path.name, file_obj, 'application/octet-stream')}
        response = session.post(url, files=files, timeout=REQUEST_TIMEOUT)
    
    payload = response.json()
    if not response.ok:
        raise RuntimeError(f'Asset upload failed: {payload}')

    public_url = payload.get('url') or payload.get('publicUrl')
    if not public_url:
        raise RuntimeError(f'No URL returned from upload: {payload}')

    print(f'   Uploaded successfully: {public_url}')
    return public_url


def create_product(session: requests.Session, api_base: str, project_id: str, model_url: str, thumbnail_url: str) -> dict:
    print('4/7 Creating draft product')
    url = f'{api_base}/products'
    payload = {
        'projectId': project_id,
        'name': 'Radio',
        'tagline': 'Classic sound, modern delivery',
        'description': 'ScanVista premium demo radio with 3D model and rich specs.',
        'category': 'Electronics',
        'sku': 'SV-RADIO-001',
        'thumbnailUrl': thumbnail_url,
        'modelUrl': model_url,
        'galleryUrls': [thumbnail_url],
        'features': ['3D preview ready', 'Wireless streaming support', 'Premium metal dial design'],
        'specs': [
            {'name': 'Frequency Range', 'value': '88–108 MHz'},
            {'name': 'Power Output', 'value': '20 W'},
            {'name': 'Weight', 'value': '1.2 kg'},
        ],
        'price': 129.99,
        'currency': 'USD',
        'buyUrl': 'https://example.com/scanvista-radio',
        'qrLabel': 'Scan to view the Radio',
    }
    return request_json(session, 'POST', url, json=payload)


def update_product_slug(session: requests.Session, api_base: str, product: dict, slug: str) -> dict:
    print(f'5/7 Updating product slug to: {slug}')

    url = f'{api_base}/products/{product["id"]}'

    payload = {
        'projectId': product['project_id'],
        'name': product['name'],
        'tagline': product.get('tagline'),
        'description': product.get('description'),
        'category': product.get('category'),
        'sku': product.get('sku'),
        'thumbnailUrl': product.get('thumbnail_url'),
        'modelUrl': product.get('model_url'),
        'galleryUrls': product.get('gallery_urls') or [],
        'features': product.get('features') or [],
        'specs': product.get('specs') or [],
        'price': product.get('price'),
        'currency': product.get('currency'),
        'buyUrl': product.get('buy_url'),
        'qrLabel': product.get('qr_label'),
        'slug': slug,
    }

    return request_json(session, 'PUT', url, json=payload)


def publish_product(session: requests.Session, api_base: str, product_id: str) -> dict:
    print('6/7 Publishing product and generating QR code')
    url = f'{api_base}/products/{product_id}/publish'
    return request_json(session, 'POST', url)


def main():
    env = load_environment()
    
    if not MODEL_ASSET.exists() or not IMAGE_ASSET.exists():
        raise FileNotFoundError('Required assets missing. Check paths for headphone.glb and image1.png')

    session = requests.Session()
    session.headers.update({'Accept': 'application/json'})

    # Login with your credentials
    auth_data = login_user(session, env['API_BASE_URL'], YOUR_EMAIL, YOUR_PASSWORD)
    access_token = auth_data.get('accessToken')
    if not access_token:
        raise RuntimeError('Login failed. Please check your credentials.')

    session.headers.update({'Authorization': f'Bearer {access_token}'})

    # Continue workflow
    project = ensure_project(session, env['API_BASE_URL'], PROJECT_NAME)
    model_url = upload_asset(session, env['API_BASE_URL'], MODEL_ASSET)
    thumbnail_url = upload_asset(session, env['API_BASE_URL'], IMAGE_ASSET)

    product = create_product(session, env['API_BASE_URL'], project['id'], model_url, thumbnail_url)
    updated_product = update_product_slug(session, env['API_BASE_URL'], product, PRODUCT_SLUG)

    publish_result = publish_product(session, env['API_BASE_URL'], updated_product['id'])

    print('\n' + '='*60)
    print('✅ SUCCESS: Radio product workflow completed!')
    print('='*60)
    print(f'   Product Slug : {PRODUCT_SLUG}')
    print(f'   Public URL   : {env["FRONTEND_BASE_URL"]}/p/{PRODUCT_SLUG}')
    print(f'   Project      : {PROJECT_NAME}')
    print('='*60)


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print(f'\n❌ ERROR: {exc}')
        sys.exit(1)
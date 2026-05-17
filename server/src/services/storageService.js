class Storageservice {
  async performTask() {
    return { success: true };
  }
}

module.exports = new Storageservice();
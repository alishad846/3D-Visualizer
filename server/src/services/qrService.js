class Qrservice {
  async performTask() {
    return { success: true };
  }
}

module.exports = new Qrservice();
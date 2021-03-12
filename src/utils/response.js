class Response {
  constructor(res) {
    this._res = res;
  }

  success(data = null, status = 200) {
    return this._res
      .status(status)
      .json({ data });
  }

  error(title, status = 400) {
    return this.errors([title], status);
  }

  errors(errorsTitles, status = 400) {
    return this._res
      .status(status)
      .json({ errors: errorsTitles.map((title) => ({ title })) });
  }

  static fromRes(res) {
    return new Response(res);
  }
}

module.exports = Response.fromRes;

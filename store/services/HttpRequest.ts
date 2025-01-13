import Request from "./Request"

class HttpRequest {
  static get(url: string, params = {}, config = {}) {
    return Request({
      url,
      method: "GET",
      params,
      ...config,
    })
  }

  static post(url: string, data: any, config = {}) {
    return Request({
      url,
      method: "POST",
      data,
      ...config,
    })
  }

  static patch(url: string, data: any, config = {}) {
    return Request({
      url,
      method: "PATCH",
      data,
      ...config,
    })
  }

  static put(url: string, data: any, config = {}) {
    return Request({
      url,
      method: "PUT",
      data,
      ...config,
    })
  }

  static delete(url: string, config = {}) {
    return Request({
      url,
      method: "DELETE",
      ...config,
    })
  }
}

export default HttpRequest

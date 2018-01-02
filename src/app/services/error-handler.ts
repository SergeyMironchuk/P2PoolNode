export class AppErrorHandler {
  public static handleError(error: any): Promise<any> {
    return Promise.reject(error.status + '. ' + error.statusText);
  }
}

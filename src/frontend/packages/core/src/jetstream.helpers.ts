import { HttpErrorResponse } from '@angular/common/http';

/**
 * Actual error response from stratos
 */
export interface JetStreamErrorResponse<T = any> {
  error: {
    status: string;
    statusCode: number;
  };
  /**
   * Actual response from proxied endpoint
   */
  errorResponse: T;
}

// TODO It would be nice if the BE could return a unique para for us to check for. #3827
// There is always a chance that this will return a false positive (more so with extensions).
export function hasJetStreamError(pages: Partial<JetStreamErrorResponse>[]): JetStreamErrorResponse {
  if (!pages || !pages.length) {
    return null;
  }
  return pages.find(page => {
    return !!(
      page &&
      page.error &&
      page.error.status &&
      page.error.statusCode &&
      'errorResponse' in page
    );
  }) as JetStreamErrorResponse;
}

export function jetStreamErrorResponseToSafeString(response: JetStreamErrorResponse): string {
  return response.error && response.error.status && response.error.statusCode ?
    `${response.error.status}. Status Code ${response.error.statusCode}` :
    null;
}

export function isHttpErrorResponse(obj: any): HttpErrorResponse {
  const props = Object.keys(obj);
  return (
    props.indexOf('error') >= 0 &&
    props.indexOf('headers') >= 0 &&
    props.indexOf('ok') >= 0 &&
    props.indexOf('status') >= 0 &&
    props.indexOf('statusText') >= 0 &&
    props.indexOf('url') >= 0
  ) ? obj as HttpErrorResponse : null;
}


export class HttpError extends Error { 
  constructor(public status: number, message: string) { 
    super(message); 
  } 
}

export function badRequest(msg = "bad request") { 
  return new HttpError(400, msg); 
}

export function unauthorized(msg = "unauthorized") { 
  return new HttpError(401, msg); 
}

export function tooLarge(msg = "payload too large") { 
  return new HttpError(413, msg); 
}

export function serverError(msg = "server error") { 
  return new HttpError(500, msg); 
}

export function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), { 
    status, 
    headers: { "Content-Type": "application/json" }
  });
}

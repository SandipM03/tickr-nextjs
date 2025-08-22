class apiError<T>{
    statusCode: number;
    data: T;
    message: string;
    success: boolean;

    constructor(
        statusCode: number,
        data: T,
        message: string = "Ahh went wrong"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = false;
    }
}
export class ApiError<T> extends Error {
    statusCode: number;
    data: T;
    success: boolean;
    errors: unknown[];

    constructor(
        statusCode: number,
        message: string = "Ahh went wrong",
        errors: Error[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null as unknown as T;
       
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

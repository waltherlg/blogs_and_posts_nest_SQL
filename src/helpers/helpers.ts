import { BadRequestException, INestApplication, ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import cookieParser from "cookie-parser";
import { AppModule } from "../app.module";
import { HttpExceptionFilter } from "../exception.filter";


export const addAppSettings = (app: INestApplication): INestApplication => {
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());
    app.enableCors();
    app.useGlobalPipes(
        new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {enableImplicitConversion: true},
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
            const errorsForResponse = [];
            errors.forEach((e) => {
            const constraintsKeys = Object.keys(e.constraints);
            constraintsKeys.forEach((ckey) => {
                errorsForResponse.push({
                message: e.constraints[ckey],
                field: e.property,
                });
            });
            });
            throw new BadRequestException(errorsForResponse);
        },
        }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    return app
}
import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from 'typeorm';
import { validate as isValidUUID } from 'uuid';


@Injectable()
export class LikesRepository {
    constructor(@InjectDataSource() protected dataSource: DataSource)
{}

async isUserAlreadyLikedPost(){
    
}

}
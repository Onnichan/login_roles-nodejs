import {getRepository} from "typeorm";
import {NextFunction, Request, Response} from "express";
import {User} from "../entity/User";
import { validate } from 'class-validator';

export class UserController {


    static getAll = async (req,res)=> {
        const userRepository = getRepository(User);
        const users = await userRepository.find()

        if(users.length > 0){
            res.send(users);
        }else{
            res.status(404).json({ message : 'Not result'});
        }
    }
    
    static getById = async (req,res)=> {
        const { id } = req.params;
        const userRepository = getRepository(User);
        
        try{
            const user = await userRepository.findOneOrFail(id);
            res.send(user);
        }catch(e){
            res.status(404).json({ message: 'Not result'})
        }
    }

    static newUser = async (req,res)=>{
        const { username, password, role } = req.body;
        const user = new User();

        user.username = username;
        user.password = password;
        user.role = role;


        //validate
        const errors = await validate(user);
        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        //TODO : HASH PASSWORD


        const userRepository = getRepository(User)
        try{
            user.hashPassword();
            await userRepository.save(user);
        }catch(e){
            return res.status(409).json({ message: 'Username already exist'})
        }

        res.send('User created');
    }

    static editUser = async (req,res)=> {

        let user;
        const { id } = req.params;
        const { username, role } = req.body;

        const userRepository = getRepository(User);

        try{
            user = await userRepository.findOneOrFail(id);
        }catch(e){
            return res.status(404).json({ message: 'User not found'})
        }

        user.username = username;
        user.role = role;

        const errors = await validate(user);

        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        // Try to save user

        try{
            await userRepository.save(user);
        }catch(e){
            return res.status(409).json({ message: 'Username already in user'})
        }
        res.status(201).json({ message: 'User update' });
    }

    static deleteUser = async (req,res)=>{
        // vendra de la url
        const { id } = req.params;
        const userRepository = getRepository(User);
        let user:User;

        try{
            user = await userRepository.findOneOrFail(id);
        }catch(e){
            return res.status(404).json({ message: 'User not found'});
        }

        // Remove user
        userRepository.delete(id);
        res.status(201).json({ message: 'User deleted' });
    }
}

export default UserController;
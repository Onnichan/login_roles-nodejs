import { validate } from 'class-validator';
import { getRepository } from 'typeorm';
import { Request,Response } from 'express';
import { User } from '../entity/User';
import * as jwt from 'jsonwebtoken';
import config from '../config/config';

class AuthController {

  static login = async (req: Request, res: Response)=>{
    const { username, password} = req.body;
    
    if(!(username && password)){
      res.status(400).json({
        message: 'Username required'
      });
    }

    const userRepository = getRepository(User);
    let user:User;

    try {
      user = await userRepository.findOneOrFail({ where: { username }});
    }catch(e){
      return res.status(400).json({message: 'Username or password incorrecct!!'});
    }

    const token = jwt.sign({ userId: user.id, username: username}, config.jwtSecret, { expiresIn: '1h'})


    res.json({ message: 'Ok', token});
  }

  static changePassword = async (req:Request, res:Response)=>{
    const { userId } = res.locals.jwtPayload;
    const { oldPaswword, newPassword } = req.body; 
    
    if(!(oldPaswword && newPassword)){
      res.status(400).json({ message: 'Old password & new password aree required'})
    }

    const userRepository = getRepository(User);
    let user:User;

    try{
      user = await userRepository.findOneOrFail(userId);
    }catch(e){
      res.status(400).json({ message:'Something goes wrong'});
    }

    if(!user.checkPassword(oldPaswword)){
      return res.status(401).json({ message:'Check your old password'})
    }

    user.password  = newPassword;
    const validationOption = { validationError: { target:false, value:false }}
    const errors = await validate(user,validationOption);

    if(errors.length > 0){
      return res.status(400).json(errors);
    }

    //Hash password

    user.hashPassword();
    userRepository.save(user);

    res.json({ message:'Password change'});
  }
}

export default AuthController;
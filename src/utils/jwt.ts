import jwt from 'jsonwebtoken'

export const generatetoken = (userId:string) =>{
    const result = jwt.sign({id:userId},'secret')
    return result; 
}

export const tokenverification = (token:string) =>{
    const decode = jwt.verify(token,'secret')
    return decode ;
}

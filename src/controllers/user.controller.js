import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { uploadOnCloudinary, uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser= asyncHandler(async(req,res) =>{
    //get user details from frontend
    //validation-not empty
    //check if user already exists:username or email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object-create entry in db
    //remove password and refresh token form response
    //check for user creation
    //return response 


    const{fullName,email,username,password}=req.body
    console.log("email:",email);

    //if(fullName===""){
      //  throw new ApiError(400,"fullname is required")
    //}
    if(
        [fullName,email,username,password].some((field)=>
            field?.trim()==="")
    )
    {
        throw new ApiError(400,"All fields are required")
    }

   const existedUser= User.findOne({
        $or:[{ email:email},{ username:username}]
   })
    if(existedUser){
        throw new ApiError(400,"User already exists with this email or username")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Failed to upload avatar image")
    }
    const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"soomething went wwrong while creating user")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )
}) 


export {registerUser}
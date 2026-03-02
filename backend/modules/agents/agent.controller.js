import * as service from "./agent.service.js";

export const registerModel = async (req, res) => {
  const { name, modelIdentifier, apiKey } = req.body;

  const agent = await service.registerUserModel({
    user: req.user,
    name,
    modelIdentifier,
    apiKey,
    
  });
  console.log(req.user);

  res.json(agent);
};

export const myModels = async (req, res) => {
  try{
    const agents = await service.getUserAgents(req.user.userId);
    res.json(agents);
  }catch(err){
    res.status(500).json({message:err.message});
  }
};
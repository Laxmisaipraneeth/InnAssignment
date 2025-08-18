import Helper from '../models/helper.model';

const generateUniqueECode = async (x: number = Math.floor(Math.random() * 1000) + 1): Promise<number> => {
  const isExists = await Helper.findOne({ eCode: x });

  if (isExists) {
    return await generateUniqueECode(Math.floor(Math.random() * 10000) + 1);
  }

  return x;
};

export default generateUniqueECode;

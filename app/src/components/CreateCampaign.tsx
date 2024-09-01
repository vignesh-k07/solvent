"use client";
import React, { useState } from 'react'
import { money } from '@/assets';
import { CustomButton, FormField, Loader } from '@/components';
import { checkIfImage } from '@/utils/constants';
import { useRouter } from 'next/navigation';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AnchorError, AnchorProvider, BN, web3 } from '@coral-xyz/anchor';
import Image from 'next/image';


interface ICreateCampaign {
  name: string;
  title: string;
  description: string;
  target: BN | null;
  deadline: BN | null;
  image: string;
}

const CreateCampaign = () => {
  const {push} = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState<ICreateCampaign>({
    name: '',
    title: '',
    description: '',
    target: null, 
    deadline:  null,
    image: ''
  });

  const handleFormFieldChange = (fieldName: string, e: React.ChangeEvent<HTMLTextAreaElement|HTMLInputElement>) => {
    setForm({ ...form, [fieldName]: e.target.value })
  }

  const createCampaign = async (form: ICreateCampaign) => {}

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    checkIfImage(form.image, async (exists: any) => {
      if(exists) {
        setIsLoading(true)
        await createCampaign({ ...form, target: new BN(1 * LAMPORTS_PER_SOL)})
        setIsLoading(false);
        push('/');
      } else {
        alert('Provide valid image URL')
        setForm({ ...form, image: '' });
      }
    })
  }

  return (
    <div className="bg-[#1c1c24] flex justify-center items-center flex-col rounded-[10px] sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] bg-[#3a3a43] rounded-[10px]">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">Start a Campaign</h1>
      </div>

      <form 
    //   onSubmit={handleSubmit}
       className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Your Name *"
            placeholder="John Doe"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange('name', e)}
          />
          <FormField 
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
          />
        </div>

        <FormField 
            labelName="Story *"
            placeholder="Write your story"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange('description', e)}
          />

        <div className="w-full flex justify-start items-center p-4 bg-[#8c6dfd] h-[120px] rounded-[10px]">
          <Image src={money} alt="money" className="w-[40px] h-[40px] object-contain"/>
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">You will get 100% of the raised amount</h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={''}
            handleChange={(e) => handleFormFieldChange('target', e)}
          />
          <FormField 
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={''}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
          />
        </div>

        <FormField 
            labelName="Campaign image *"
            placeholder="Place image URL of your campaign"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleFormFieldChange('image', e)}
          />

          <div className="flex justify-center items-center mt-[40px]">
            <CustomButton 
              btnType="submit"
              title="Submit new campaign"
              styles="bg-[#1dc071]"
            />
          </div>
      </form>
    </div>
  )
}

export default CreateCampaign
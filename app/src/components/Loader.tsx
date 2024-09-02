import React from 'react'
import { Oval } from 'react-loader-spinner'

interface ILoader {
    isLoading: boolean;
}

const Loader = ({isLoading}: ILoader) => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
        <div className="flex gap-5 h-fit flex items-left justify-center">
              <Oval
                visible={isLoading}
                height="34"
                width="34"
                color="#2C2D30"
                secondaryColor="#EEF7FF"
                strokeWidth={3}
                ariaLabel="oval-loading"
                wrapperClass="solvent-loader"
              />
              <h1 className="text-white text-2xl font-bold">Loading...</h1>
            </div>
      </div>
  )
}

export default Loader
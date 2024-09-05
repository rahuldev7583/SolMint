import React from "react";
import { PiCurrencyDollarBold } from "react-icons/pi";
import { RiCurrencyFill } from "react-icons/ri";

const Navbar = () => {
  return (
    <div className="flex md:mt-8 md:ml-10 mt-4 ml-2">
      {/* <PiCurrencyDollarBold size={32} /> */}
      <RiCurrencyFill size={32} />
      <h1 className="text-2xl font-bold">SolMint</h1>
    </div>
  );
};

export default Navbar;

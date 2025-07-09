import Link from "next/link";
import React from "react";

const Navbar = () => {
    return (
        <div className="navbar-container flex justify-between items-end mt-2 p-4 h-16 bg-[#201c1c] text-white rounded-b-lg w-2/3">
            <div className="navbar-logo flex items-center gap-2">
                <i className="fa fa-cube text-3xl text-[#7974ea]" aria-hidden="true"></i>
                <span className="text-2xl font-bold">KronJob</span>
            </div>
            <div className="navbar-links flex items-center gap-4 text-lg font-semibold cursor-pointer">
                <Link href="/pricing">Pricing</Link>
                <Link href="/demo">Demo</Link>
            </div>
        </div>
    );
};

export default Navbar;
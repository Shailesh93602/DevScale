"use client";

import Link from "next/link";
import { useState } from "react";

const Step1 = ({ fullName, setFullName, dob, setDOB, gender, setGender }) => (
    <div>
        <div>
            <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-900">Full Name</label>
            <input type="text" name="fullName" id="fullName" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
            <label htmlFor="dob" className="block mb-2 text-sm font-medium text-gray-900">Date of Birth</label>
            <input type="date" name="dob" id="dob" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required value={dob} onChange={(e) => setDOB(e.target.value)} />
        </div>
        <div>
            <label htmlFor="gender" className="block mb-2 text-sm font-medium text-gray-900">Gender</label>
            <select name="gender" id="gender" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
            </select>
        </div>
    </div>
);

const Step2 = ({ mobile, setMobile, whatsapp, setWhatsapp, address, setAddress }) => (
    <div>
        <div>
            <label htmlFor="mobile" className="block mb-2 text-sm font-medium text-gray-900">Mobile Number</label>
            <input type="tel" name="mobile" id="mobile" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="1234567890" required value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>
        <div>
            <label htmlFor="whatsapp" className="block mb-2 text-sm font-medium text-gray-900">Whatsapp Number</label>
            <input type="tel" name="whatsapp" id="whatsapp" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="1234567890" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </div>
        <div>
            <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900">Address</label>
            <textarea name="address" id="address" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="123 Street, City, Country" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
        </div>
    </div>
);

const Step3 = ({ university, setUniversity, college, setCollege, branch, setBranch, semester, setSemester }) => (
    <div>
        <div>
            <label htmlFor="university" className="block mb-2 text-sm font-medium text-gray-900">University</label>
            <input type="text" name="university" id="university" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Your University" value={university} onChange={(e) => setUniversity(e.target.value)} />
        </div>
        <div>
            <label htmlFor="college" className="block mb-2 text-sm font-medium text-gray-900">College</label>
            <input type="text" name="college" id="college" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Your College" value={college} onChange={(e) => setCollege(e.target.value)} />
        </div>
        <div>
            <label htmlFor="branch" className="block mb-2 text-sm font-medium text-gray-900">Branch</label>
            <input type="text" name="branch" id="branch" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Your Branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
        </div>
        <div>
            <label htmlFor="semester" className="block mb-2 text-sm font-medium text-gray-900">Semester</label>
            <input type="number" name="semester" id="semester" className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Your Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
        </div>
    </div>
);

export default function Details() {
    const [fullName, setFullName] = useState("");
    const [dob, setDOB] = useState("");
    const [gender, setGender] = useState("");
    const [mobile, setMobile] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [address, setAddress] = useState("");
    const [university, setUniversity] = useState("");
    const [college, setCollege] = useState("");
    const [branch, setBranch] = useState("");
    const [semester, setSemester] = useState("");
    const [step, setStep] = useState(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) {
            setStep(step + 1);
        } else {
            if (!fullName) return document.getElementById('fullName').focus();
            if (!dob) return document.getElementById('dob').focus();
            if (!gender) return document.getElementById('gender').focus();
            if (!mobile) return document.getElementById('mobile').focus();
            if (!address) return document.getElementById('address').focus();
            if (!university) return document.getElementById('university').focus();
            if (!college) return document.getElementById('college').focus();
            if (!branch) return document.getElementById('branch').focus();
            if (!semester) return document.getElementById('semester').focus();

            let result = await fetch("http://localhost:4000/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    dob,
                    gender,
                    mobile,
                    whatsapp,
                    address,
                    university,
                    college,
                    branch,
                    semester
                }),
                credentials: 'include'
            });
            let json = await result.json();
            if (json.success) console.log(json);
        }
    }

    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <Link href="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                    Mr. Engineers
                </Link>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Register
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                            {step === 1 && <Step1 fullName={fullName} setFullName={setFullName} dob={dob} setDOB={setDOB} gender={gender} setGender={setGender} />}
                            {step === 2 && <Step2 mobile={mobile} setMobile={setMobile} whatsapp={whatsapp} setWhatsapp={setWhatsapp} address={address} setAddress={setAddress} />}
                            {step === 3 && <Step3 university={university} setUniversity={setUniversity} college={college} setCollege={setCollege} branch={branch} setBranch={setBranch} semester={semester} setSemester={setSemester} />}
                            <div className="flex justify-between">
                                {step > 1 && <button type="button" className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center" onClick={() => setStep(step - 1)}>Previous</button>}
                                <button type="submit" className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">{step < 3 ? 'Next' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}

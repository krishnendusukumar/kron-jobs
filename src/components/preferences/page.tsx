"use client"; // If you're using Next.js App Router with client-side interactivity

import { useState } from "react";

export default function PreferencesForm() {
    const [formData, setFormData] = useState({
        jobTitle: "",
        keywords: "",
        location: "",
        min_salary: "",
        notifyMethod: "Mail",
        experience: "",
        phone: "",
        email: "",
    });

    const [status, setStatus] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("Submitting...");

        try {
            const res = await fetch("/api/submit-preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            // Check if response is ok before trying to parse JSON
            if (!res.ok) {
                const errorText = await res.text();
                console.error('Response error:', errorText);
                setStatus("❌ Server error: " + (res.statusText || 'Unknown error'));
                return;
            }

            const result = await res.json();
            if (result.success) {
                setStatus("✅ Preferences saved!");
                setFormData({
                    jobTitle: "",
                    keywords: "",
                    location: "",
                    min_salary: "",
                    notifyMethod: "Mail",
                    experience: "",
                    phone: "",
                    email: "",
                });
            } else {
                setStatus("❌ Error: " + result.error);
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            setStatus("❌ Network error: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="text" name="jobTitle" placeholder="Job Title" className="w-1/2 p-2 rounded-md" value={formData.jobTitle} onChange={handleChange} required />
            <input type="text" name="keywords" placeholder="Keywords" className="w-1/2 p-2 rounded-md" value={formData.keywords} onChange={handleChange} />
            <input type="text" name="location" placeholder="Location" className="w-1/2 p-2 rounded-md" value={formData.location} onChange={handleChange} required />
            <input type="number" name="min_salary" placeholder="Minimum Salary (in USD)" className="w-1/2 p-2 rounded-md" value={formData.min_salary} onChange={handleChange} />
            <select name="notifyMethod" value={formData.notifyMethod} className="w-1/2 p-2 rounded-md" onChange={handleChange}>
                <option value="Mail" className="w-1/2 p-2 rounded-md" >Mail</option>
                <option value="WhatsApp" className="w-1/2 p-2 rounded-md" >WhatsApp</option>
            </select>
            <input type="text" name="experience" placeholder="Experience (in years)" className="w-1/2 p-2 rounded-md" value={formData.experience} onChange={handleChange} />
            <input type="text" name="phone" placeholder="Phone with country code (optional)" className="w-1/2 p-2 rounded-md" value={formData.phone} onChange={handleChange} />
            <input type="email" name="email" placeholder="Email" className="w-1/2 p-2 rounded-md" value={formData.email} onChange={handleChange} required />

            <button className="w-1/2 p-2 rounded-md bg-[#7974ea] text-white cursor-pointer" type="submit">Submit</button>

            {status && <p>{status}</p>}
        </form>
    );
}

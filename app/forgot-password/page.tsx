'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/input/page';
import Image from 'next/image';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Check your email for reset instructions');
                setEmail('');
            } else {
                setMessage(data.error || 'Something went wrong');
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-full w-full">
            <div className="loginContainer text-2xl text-red-500">
                <nav className="loginNav px-12 py-5 sm:px-16 sm:py-5 flex justify-center sm:justify-start">
                    <Image 
                        src="/images/sport.ev-red-letters (1).png" 
                        alt="sportEv-logo" 
                        width={240} 
                        height={96}
                        className="h-[6rem]"
                    />
                </nav>
                <div className="loginPage flex justify-center pb-[20rem]">
                    <div className="loginBox bg-gray-400 bg-opacity-20 px-16 py-16 self-center lg:w-2/5 lg:max-w-md rounded-md sm:m-4 border border-solid border-red-500 neon-effect">
                        <h3 className="loginTitle text-red-500 mb-8 font-semibold">
                            Reset Password
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <Input 
                                label="Email"
                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setEmail(ev.target.value)}
                                id="email"
                                type="email"
                                value={email}
                            />
                            {message && (
                                <div className={`mt-4 text-sm text-center ${
                                    message.includes('Check your email') ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {message}
                                </div>
                            )}
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="loginButton bg-red-700 py-3 text-white rounded-md w-full mt-10 hover:bg-red-800 hover:shadow-neon transition flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="loader"></div>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                            <Link 
                                href="/start" 
                                className="block text-center text-sm text-white hover:underline mt-4"
                            >
                                Back to Login
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
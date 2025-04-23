'use client';

import React, { useState } from 'react';
import Input from '../components/input/page';
import './start.css';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Start = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | React.ReactNode>('');
    const router = useRouter();

    const login = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            });

            if (result?.error) {
                if (result.error === 'Email does not exist') {
                    setError('El correo electrónico no existe');
                } else if (result.error === 'Incorrect password') {
                    setError(
                        <div className="mt-2 text-red-500 text-sm text-center animate-pulse">
                            Contraseña incorrecta
                        </div>
                    );
                } else {
                    setError('Ocurrió un error al iniciar sesión');
                }
            } else {
                router.push('/');
            }
        } catch (error) {
            setError('Ocurrió un error al iniciar sesión');
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
                        <h3 className="loginTitle text-red-500 mb-8 font-semibold">Sign in</h3>
                        <div className="inputContainer flex flex-col gap-4">
                            <Input 
                                label='Email'
                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setEmail(ev.target.value)}
                                id='email'
                                type='email'
                                value={email}
                            />
                            <Input 
                                label='Password'
                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setPassword(ev.target.value)}
                                id='password'
                                type='password'
                                value={password}
                            />
                            {error && <div>{error}</div>}
                        </div>
                        <button 
                            onClick={login} 
                            disabled={isLoading}
                            className='loginButton bg-red-700 py-3 text-white rounded-md w-full mt-10 hover:bg-red-800 hover:shadow-neon transition flex items-center justify-center gap-2'
                        >
                            {isLoading ? (
                                <div className="loader"></div>
                            ) : 'Login'}
                        </button>
                        <div className="flex justify-between items-center mt-4">
                            <Link 
                                href="/register" 
                                className="text-sm text-white hover:underline cursor-pointer"
                            >
                                Create an account
                            </Link>
                            <Link 
                                href="/forgot-password" 
                                className="text-sm text-white hover:underline cursor-pointer"
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Start;
'use client'


import LoginHeader from '@/components/Login/LoginHeader';
import LoginFooter from '@/components/Login/LoginFooter';
import LoginForm from '@/components/Login/LoginForm';

const Login = () => {


  return (
    <section className="flex flex-col justify-center px-4 pt-12 pb-10 ">
      <LoginHeader />
      <LoginForm />
      <LoginFooter />
    </section>
    
  )
}

export default Login
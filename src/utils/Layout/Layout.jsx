
import { Outlet } from 'react-router-dom'
import Header from '../AppHeader';
import Footer  from '../Footer';

const Layout = () => {
  return (
    <>
    <Header/>
    <Outlet/>
    <Footer/>

    </>
  )
}

export default Layout
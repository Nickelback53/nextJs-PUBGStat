import { Menu } from 'semantic-ui-react'
import { useRouter } from 'next/router';

export default function Gnb() {
    let activeItem = 'home';
    const router = useRouter();

    
    function goLink(e, data){
        if(data.name === 'home'){
            router.push('/');
        }else if (data.name === 'about'){
            router.push('/about');
        }
    }
    return (
        <Menu inverted>
        <Menu.Item
          name='home'
          active={activeItem === 'home'}
          onClick={goLink}
        />

      </Menu>
    )
}
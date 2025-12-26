import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';

const social_medias = [
    { name: "Instagram", href: "https://www.instagram.com/costa_matheus000/", icon: <FaInstagram size={20}/> },
    { name: "Linkedin", href: "https://www.linkedin.com/in/matheus-pc/", icon: <FaLinkedin size={20}/> },
    { name: "Github", href: "https://github.com/matheus-costa-dev", icon: <FaGithub size={20}/> },
]

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 mt-auto">
            <div className="container flex mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className='w-full'>
                    <p className="text-center text-sm text-gray-400">
                        &copy; {currentYear} | Desenvolvido para fins de transparência e controle.
                    </p>
                </div>
                <div className='flex gap-2'>
                    {social_medias.map((item, key) => (
                        <a href={item.href} key={key}>
                            {item.icon}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    )
}

export default Footer
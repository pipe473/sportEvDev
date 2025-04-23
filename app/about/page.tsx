import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-40 mb-20">
                <div className="max-w-3xl mx-auto px-4 text-white space-y-6">
                    <h1 className="text-4xl font-bold mb-8">Sobre nosotros</h1>
                    
                    <p className="text-lg leading-relaxed">
                        La historia de Sport.Ev comienza en 2016 con una idea innovadora: crear una plataforma dedicada a la organización de competiciones deportivas. Sin embargo, como toda gran visión, nuestra idea evolucionó con el tiempo.
                    </p>
                    
                    <p className="text-lg leading-relaxed">
                        En 2019, nuestra misión se transformó, enfocándonos en desarrollar una plataforma especializada en la gestión y entrada de eventos deportivos. Fue en este punto cuando empezamos a dar vida a este proyecto con pasión y dedicación.
                    </p>
                    
                    <p className="text-lg leading-relaxed">
                        La startup Sport.Ev tomó forma gracias al esfuerzo conjunto de sus creadores, Diego Dos Santos y Felipe Bedoya y la colaboración de Anna Maria Rivera que es consultora de negocios y emprendedora, quienes compartieron su experiencia y visión para llevar esta idea al siguiente nivel. Desde entonces, hemos trabajado para construir una solución que conecte las personas con los eventos deportivos.
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
} 
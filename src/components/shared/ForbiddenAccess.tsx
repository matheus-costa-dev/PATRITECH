import React from 'react'
import Link from 'next/link'

function ForbiddenAccess() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <p className="font-bold uppercase tracking-widest text-gray-500">Acesso Negado</p>
            <Link href="/" className="text-[#00BFFF] underline mt-4">Voltar para o Login</Link>
        </div>


    )
}

export default ForbiddenAccess

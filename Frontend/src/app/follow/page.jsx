import React from 'react'
import Followcard from '../../components/followcard'

const page = () => {
    return (
        <div className='roadmap-container p-6 bg-gray-100 dark:bg-gray-800 min-h-screen'>
            <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 text-center">
                Follow for challange your frineds
            </h1>
            <Followcard />
        </div>
    )
}

export default page
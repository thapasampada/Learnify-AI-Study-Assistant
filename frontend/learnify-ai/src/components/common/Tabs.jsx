import React from 'react'

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className='w-full'>
        <div className='relative border-b-2 border-[#EAF2F2]'>
            <nav className='flex gap-2'>
                {tabs.map((tab) => {
                    return (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative pb-4 px-6 text-sm font-semibold transition-all duration-200 ${
                                activeTab === tab.name
                                    ? 'text-[#3D7F87]'
                                    : 'text-[#647278] hover:text-[#2A3439]'
                            }`}
                        >
                            <span className='relative z-10'>{tab.label}</span>
                            {activeTab === tab.name && (
                                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#4F9DA6] to-[#3D7F87] rounded-full shadow-lg shadow-[#4F9DA6]/25' />
                            )}

                            {activeTab === tab.name && (
                                <div className='absolute inset-0 bg-linear-to-b from-[#EAF2F2]/60 to-transparent rounded-t-xl -z-10' />
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>
        <div className='py-6'>
            {tabs.map((tab) => {
                if (tab.name === activeTab) {
                    return (
                        <div key={tab.name} className=''>
                            {tab.content}
                        </div>
                    )
                }
                return null
            })}
        </div>
    </div>
  )
}

export default Tabs

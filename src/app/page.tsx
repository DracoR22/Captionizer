import SparklesIcon from "@/components/icons/sparkles"
import UploadIcon from "@/components/icons/upload"
import UploadButton from "@/components/upload-button"

const Home = () => {
  return (
    <main className="p-4 max-w-2xl mx-auto">
      <header className="flex justify-between my-4">
        <a href="" className="font-semibold">Captionizer</a>
        <nav className="flex gap-6">
          <a href="" className="font-medium">Home</a>
          <a href="" className="font-medium">Contact</a>
        </nav>
      </header>
      <div className="text-center mt-24">
        <h1 className="text-3xl font-semibold">Create captions for your videos for free</h1>
        <h2 className="text-neutral-800 mt-4">Start by uploading a video and we&apos;ll do the rest</h2>
        <h3 className="mt-8 text-6xl font-semibold">100% <span className="text-indigo-500 font-bold">Free</span></h3>
        <p className="text-sm text-neutral-600 mt-2 mb-8">No payments, no subscriptions, no bs watermarks</p>
      </div>
      <div className="text-center">
        <UploadButton/>
      </div>
      <div className="flex justify-around mt-12 items-center">
        <div className="w-[240px] h-[480px] bg-neutral-200 rounded-lg">
            
        </div>
        <div>
          <SparklesIcon/>
        </div>
        <div className="w-[240px] h-[480px] bg-neutral-200 rounded-lg">
            
        </div>
      </div>
    </main>
  )
}

export default Home
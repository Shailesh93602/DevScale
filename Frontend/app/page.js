"use client"
import Footer from "./Components/Footer";
import Learn from "./Components/Learn";
import Nav from "./Components/Nav";
import Course from "./Course/page";
import Data from "./Data/Showcase.json"

export default function Home() {
  const slogan = Data.Home[0].slogan;
  return (
    <>
      <Nav />
      <main className="flex min-h-screen flex-col items-center justify-between p-10">
        <div class="items-center w-10/12 grid-cols-2 mx-auto overflow-x-hidden lg:grid md:py-14 lg:py-24 xl:py-14 lg:mt-3 xl:mt-5" data-aos="fade-right" data-aos-duration="800">
          <div class="pr-2 md:mb-14 py-14 md:py-0">
            <h1 class="text-3xl font-semibold text-blue-900 xl:text-5xl lg:text-3xl"><span class="block w-full">{slogan}</span></h1>
            <p class="py-4 text-lg text-gray-500 2xl:py-8 md:py-6 2xl:pr-5">
              Our platform offers a wide range of resources, including
              tutorials, practice exercises, career guidance, and more.
              Whether you're a student just starting out or preparing for
              placement interviews, we have the tools and support you need
              to succeed
            </p>
            <div class="mt-4">
              <a href="#contact" class="px-5 py-3 text-lg tracking-wider text-white bg-blue-500 rounded-lg md:px-8 hover:bg-blue-600 group"><span>Quick Explore</span> </a>
            </div>
          </div>

          <div class="pb-10 overflow-hidden md:p-10 lg:p-0 sm:pb-0 rounded-xl">


            <div class="flex flex-col h-72 bg-gray-900 text-gray-200 font-mono rounded-lg">
              <div class="flex items-center h-10 px-4 bg-gray-800">
                <div class="h-3 w-3 mr-2 rounded-full bg-red-500"></div>
                <div class="h-3 w-3 mr-2 rounded-full bg-yellow-500"></div>
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
              </div>

              <div class="flex-1 p-4">
                <div class="flex">
                  <div class="mr-2">&gt;</div>
                  <input type="text" class="flex-1 bg-gray-800 focus:outline-none" placeholder="Type your language here" />
                </div>

                <div class="mt-2">
                  <span class="text-green-500">&gt; Output:</span>
                  <div class="bg-gray-800 p-2 mt-1">
                    <p>This is a sample output</p>
                  </div>
                </div>
              </div>
            </div>



            {/* <img id="heroImg1" class="transition-all duration-300 ease-in-out hover:scale-105 lg:w-full sm:mx-auto sm:w-4/6 sm:pb-12 lg:pb-0" src="https://bootstrapmade.com/demo/templates/FlexStart/assets/img/hero-img.png" alt="Awesome hero page image" width="500" height="488" /> */}
          </div>
        </div>

      </main>
      <Course />
      <Learn />
      <Footer />
    </>
  );
}

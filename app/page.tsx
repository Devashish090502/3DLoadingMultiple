import Scene from "../components/Scene";

export default function Home() {
  return (
    <main className="relative w-screen h-screen">
      <div className="absolute top-0 left-0 w-full h-full">
        <Scene />
      </div>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10">
        <h1 className="text-4xl font-bold text-white bg-black/50 p-4 rounded-lg">
          BlueBlood 3D
        </h1>
      </div>
    </main>
  );
}
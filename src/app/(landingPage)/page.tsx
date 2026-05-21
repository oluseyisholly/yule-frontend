import Footer from "@/layouts/Footer";
import Header from "@/layouts/Header";
import HomeScreen from "@/screens/HomeScreen";

export default function Page() {
  return (
    <div>
      <Header />
      <div className="flex-1">
        <HomeScreen />
      </div>
      <Footer />
    </div>
  );
}

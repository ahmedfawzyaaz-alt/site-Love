import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollY() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handelScroll = () => {
      if (window.scrollY >= 400) {
        setShow(true);
      } else {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handelScroll);
  }, []);

  const eventScroll = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <>
      {show && (
        <div className="fixed right-5 bottom-4 z-10">
          <button
            className="px-2 py-2 rounded bg-white/70 text-gray-700 flex justify-center items-center"
            onClick={eventScroll}
          >
            <FaArrowUp />
          </button>
        </div>
      )}
    </>
  );
}

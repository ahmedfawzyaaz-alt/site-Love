import { useEffect, useState } from "react";
import "./App.css";
import { IoHeartSharp } from "react-icons/io5";
import { Bounce, toast } from "react-toastify";
import { FaCookie } from "react-icons/fa";

const initialMemories = [];

const resizePhoto = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image"));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Failed to load image"));

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1200;
        const scale = Math.min(
          1,
          maxSize / Math.max(image.width, image.height),
        );

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Canvas is not supported"));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
};

export default function App() {
  const [unlocked, setUnlocked] = useState(
    JSON.parse(localStorage.getItem("unlocked")),
  );

  const [password, setPassword] = useState("");
  const [hearts, setHearts] = useState([]);
  const [isDashboard, setIsDashboard] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [memories, setMemories] = useState(() => {
    const saved = localStorage.getItem("memories");
    return saved ? JSON.parse(saved) : initialMemories;
  });

  useEffect(() => {
    localStorage.setItem("memories", JSON.stringify(memories));
  }, [memories]);

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem("goals");

    if (saved) {
      return JSON.parse(saved);
    }

    return [
      { id: 1, text: "💍 إننا نتجوز", completed: false },
      { id: 2, text: "🕋 إننا نطلع عمرة سوا", completed: false },
      { id: 3, text: "✈️ إننا نسافر سوا", completed: false },
      { id: 4, text: "🌍 إننا نتعلم لغة سوا", completed: false },
      { id: 5, text: "👶🏻 إن يكون عندنا بيبي", completed: false },
    ];
  });

  // Save goals whenever they change
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  const saveMemories = (nextMemories) => {
    try {
      localStorage.setItem("memories", JSON.stringify(nextMemories));
      setMemories(nextMemories);
      toast.success("تم حفظ التغييرات ❤️");
      return true;
    } catch (error) {
      console.error("Could not save memories to local storage:", error);
      toast.error("مساحة التخزين ممتلئة. اختاري صورة أصغر وحاولي تاني.");
      return false;
    }
  };

  const addMemory = (event) => {
    event.preventDefault();
    if (!newTitle.trim() || !newPhoto) {
      toast.error("اكتب عنوان واختار صورة الأول.");
      return;
    }

    const saved = saveMemories([
      { id: Date.now(), image: newPhoto, title: newTitle.trim() },
      ...memories,
    ]);
    if (saved) {
      setNewTitle("");
      setNewPhoto("");
      event.currentTarget.reset();
    }
  };

  // Falling hearts
  useEffect(() => {
    const interval = setInterval(() => {
      const heart = {
        id: Date.now(),
        left: Math.random() * 100,
        size: Math.random() * 20 + 15,
        duration: Math.random() * 3 + 4,
      };

      setHearts((prev) => [...prev, heart]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((item) => item.id !== heart.id));
      }, heart.duration * 1000);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-pink-100 px-6 overflow-hidden">
      {/* Hearts */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="absolute top-[-30px] animate-fall"
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
              animationDuration: `${heart.duration}s`,
            }}
          >
            <IoHeartSharp className="text-[red]" />
            🌸🍪
          </span>
        ))}
      </div>

      {/* Content */}
      <div
        className={`relative z-10 w-full text-center ${
          unlocked
            ? "relative z-10 w-full flex justify-center"
            : "relative z-10 w-full min-h-screen flex items-center justify-center"
        }`}
      >
        {unlocked ? (
          <div className="grid grid-cols-12">
            <div className="col-span-12 flex justify-end pt-5">
              <button
                type="button"
                onClick={() => setIsDashboard((current) => !current)}
                className="rounded-full bg-white/80 px-5 py-2 text-sm font-semibold text-pink-600 shadow-sm hover:bg-white"
              >
                {isDashboard ? "العودة للذكريات ←" : "إدارة الصور ✨"}
              </button>
            </div>

            {isDashboard ? (
              <div className="col-span-12 mx-auto my-5 w-full max-w-2xl rounded-3xl bg-white/80 p-5 text-right shadow-lg shadow-pink-100/50 sm:p-8">
                <p className="text-sm font-semibold text-pink-500">
                  لوحة الذكريات
                </p>
                <h1 className="mb-6 mt-2 text-2xl font-bold text-gray-800">
                  اضافة صورة وعنوان جديد📸
                </h1>

                <form onSubmit={addMemory} className="mb-8 space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    عنوان الصورة
                    <textarea 
                    rows={4}
                      value={newTitle}
                      onChange={(event) => setNewTitle(event.target.value)}
                      maxLength={160}
                      placeholder="اكتب عنوان الذكرى..."
                      className="mt-2 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 outline-none focus:border-pink-300"
                    />
                  </label>

                  <label className="block text-sm font-medium text-gray-700">
                    اختار صورة
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setNewPhoto("");
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error(
                            "حجم الصورة لازم يكون أقل من 10 ميجابايت.",
                          );
                          event.target.value = "";
                          return;
                        }
                        try {
                          setNewPhoto(await resizePhoto(file));
                        } catch (error) {
                          console.error(
                            "Could not read the selected photo:",
                            error,
                          );
                          toast.error("تعذر فتح الصورة. اختاري صورة تانية.");
                        }
                      }}
                      className="mt-2 block w-full rounded-2xl border border-pink-100 bg-white p-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-pink-100 file:px-4 file:py-2 file:text-pink-700"
                    />
                  </label>

                  {newPhoto && (
                    <img
                      src={newPhoto}
                      alt="معاينة الصورة الجديدة"
                      className="h-48 w-full rounded-2xl object-cover"
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-full bg-pink-500 py-3 font-semibold text-white transition hover:bg-pink-600"
                  >
                    إضافة للذكريات ＋
                  </button>
                  <p className="text-xs text-gray-500">
                    الصور بتتصغر تلقائيًا وبتتحفظ على نفس الجهاز والمتصفح.
                  </p>
                </form>

                <h2 className="mb-4 text-lg font-bold text-gray-800">
                  تعديل الذكريات الحالية ({memories.length})
                </h2>
                <div className="space-y-3">
                  {memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="flex items-center gap-3 rounded-2xl bg-pink-50/70 p-3"
                    >
                      <img
                        src={memory.image}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <input
                        aria-label="عنوان الذكرى"
                        defaultValue={memory.title}
                        maxLength={160}
                        onBlur={(event) => {
                          const title = event.target.value.trim();
                          if (!title) {
                            event.target.value = memory.title;
                            toast.error("عنوان الذكرى ماينفعش يكون فاضي.");
                            return;
                          }
                          if (title === memory.title) return;
                          saveMemories(
                            memories.map((item) =>
                              item.id === memory.id ? { ...item, title } : item,
                            ),
                          );
                        }}
                        className="min-w-0 flex-1 rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm outline-none focus:border-pink-300"
                      />
                      <button
                        type="button"
                        aria-label="حذف الذكرى"
                        onClick={() => {
                          if (
                            !window.confirm("متأكدة إنك عايزة تحذفي الذكرى؟")
                          ) {
                            return;
                          }
                          saveMemories(
                            memories.filter((item) => item.id !== memory.id),
                          );
                        }}
                        className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                  {memories.length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-500">
                      ❤️ لسه مفيش ذكريات. أضيف أول صورة من فوق
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="col-span-12 ">
                <div className="card w-auto bg-white/70 p-4 gap-3 my-3 rounded-3xl shadow flex flex-col flex-wrap mx-auto backdrop-blur-sm shadow-pink-100/50 px-7 py-8">
                  <h3>
                    دي هدية صغيرة ليكي يا كوكيز عشان نملاها بصورنا طول أيامنا
                    اللي
                    <p> 🍪♥️♾️جايه وأحنا مع بعض يا حبيبتي </p>
                  </h3>

                  <p className="text-sm text-gray-700">
                    🤏❤️ كل اللي هتشوفيه نبذه صغننه عن حبي ليكي
                  </p>
                </div>

                <div className="p-4 rounded-3xl backdrop-blur-sm bg-white/70 shadow shadow-pink-100/50 mt-8">
                  <p className="text-sm text-pink-400 font-semibold">
                    For Us 🌺
                  </p>

                  <h3 className="text-sm my-4 text-gray-800">
                    عملتلك المكان ده عشان يحفظ أجمل لحظاتنا وصورنا وكلامنا،
                    <p>
                      ونرجعله دايماً نفتكر ونبتسم. إنت أجمل حاجة حصلتلي، وربنا
                      يديمك في حياتي يا روحي
                    </p>
                  </h3>

                  <span>🥰❤️</span>
                </div>

                <div className="my-3">
                  <h3 className="font-bold">Our Story 📖</h3>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="p-4 rounded-3xl backdrop-blur-sm bg-white/70 shadow shadow-pink-100/50">
                    <div className="my-2">
                      <span className="px-3 rounded-2xl bg-pink-500 text-white">
                        01/09/2026
                      </span>
                    </div>

                    <h3 className="my-2.5">اليوم اللي قلتلك فيه أحبك</h3>

                    <p className="text-sm text-gray-700 flex flex-col leading-9  ">
                      <span>
                        أهم يوم ف حياتي و لحظة دخول السرور قلبي و يومها عرفت
                        أنني إنتصرت وفُزت بكِ يا عمري <p>🥹👫♥️♥️</p>
                      </span>

                      <p className="my-8">
                        قبلت بكِ وزوجتك نفسي لبقية أنفاس حياتي و سأعيش معك العمر
                        كله و أكون لكِ سنداً و حامياً في السراء والضراء و في
                        أعنف المعارك محاربً لا يخشى شيئ إلا الله، لن أترك يديكي
                        أبداً و سوف أفعل كل ما في وسعى لأفوز بكِ و أنالكِ يا
                        عمري الماضي والحاضر و المستقبل، قلتها و سأقولها ثانية،
                        سأفوز بكِ و سأفعل المستحيل لأنالك يا حبيبة عمري و فتاة
                        أحلامي، أحبك من كل أعماق أعماق أعماق قلبي يا آنيسه روحي
                        <p>
                          و شريان قلبي النابض، بكِ أستآنث وبكِ أقوى وبتشجيعك
                          اكون ما اريد و تريدي
                          <p>🥹🌸🍪</p>
                        </p>
                        <p className="mt-5">
                          {" "}
                          🥹💍🫂♥️♥️- أحبكك بشدة يا زوجتي العزيزة
                        </p>
                      </p>
                    </p>
                  </div>
                  <div className="p-4 rounded-3xl backdrop-blur-sm bg-white/70 shadow shadow-pink-100/50">
                    <div className="my-2">
                      <span className="px-3 rounded-2xl bg-pink-500 text-white">
                        30/10/2026
                      </span>
                    </div>

                    <h3 className="my-2.5">أول يوم شوفتك فيه</h3>

                    <span className="text-sm text-gray-700">
                      مكنتش عارف إن اليوم ده هيبقي أهم يوم في حياتي.. بس قلبي
                      كان عارف
                    </span>
                  </div>

                  <div className="p-4 rounded-3xl backdrop-blur-sm bg-white/70 shadow shadow-pink-100/50 ">
                    <div className="my-2">
                      <span className="px-3 rounded-2xl bg-pink-500 text-white">
                        01/09/2026
                      </span>
                    </div>

                    <div className="h-100">
                      <img
                        src="./assets/ramadan.jpg"
                        alt=""
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    </div>

                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">
                        ♥️ مش محتاج أتمنى حاجة تاني.. إنتي كل اللي بتمناه
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-5">
                    <div className="w-25 ">
                      <img src="./assets/sticker.png" alt="" />
                    </div>
                    <div className="w-25 ">
                      <img src="./assets/sticker.png" alt="" />
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl backdrop-blur-sm bg-white/70 shadow shadow-pink-100/50">
                    <div className="my-2">
                      <span className="px-3 rounded-2xl bg-pink-500 text-white">
                        30/10/2026
                      </span>
                    </div>

                    <div className="h-100">
                      <img
                        src="./assets/ramadan2.jpg"
                        alt=""
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    </div>

                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">
                        🌸🍪🥺أحببتُ الحياةَ حين أحببتكِ
                      </span>
                    </div>
                  </div>
                </div>

                {/* Our Dreams */}

                <div className="col-span-2 w-full mt-8 mb-5">
                  <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-sm shadow shadow-pink-100/50">
                    <p className="text-sm text-pink-400 font-semibold">
                      Our Dreams Together ❤️
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-2">
                      أحلام نفسي أحققها معاكي
                    </h2>

                    <p className="text-xs text-gray-500 mt-2">
                      ❤️ مش مجرد أحلام.. دي حاجات نفسي نعيشها سوا
                    </p>

                    {/* Progress */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">
                          Our progress
                        </span>

                        <span className="text-xs font-semibold text-pink-500">
                          {goals.filter((goal) => goal.completed).length} /{" "}
                          {goals.length}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-pink-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (goals.filter((goal) => goal.completed).length /
                                goals.length) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Goals */}
                    <div className="mt-6 flex flex-col gap-3">
                      {goals.map((goal) => (
                        <div
                          key={goal.id}
                          onClick={() => {
                            setGoals((prev) =>
                              prev.map((item) =>
                                item.id === goal.id
                                  ? {
                                      ...item,
                                      completed: !item.completed,
                                    }
                                  : item,
                              ),
                            );
                          }}
                          className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                            goal.completed
                              ? "bg-pink-100"
                              : "bg-white/60 hover:bg-pink-50"
                          }`} dir="rtl"
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              goal.completed
                                ? "bg-pink-400 border-pink-400 text-white"
                                : "border-pink-300"
                            }`}
                          >
                            {goal.completed && "✓"}
                          </div>

                          <span
                            className={`text-sm ${
                              goal.completed
                                ? "line-through text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {goal.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <p className="my-5 text-2xl font-semibold " dir="trl">
                  ✨ ذكرياتنا مع بعض
                </p>

                <div className="grid grid-cols-1 gap-3 my-7">
                  {memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="rounded-3xl bg-white/70 p-2.5 shadow-sm shadow-pink-100 backdrop-blur-sm"
                    >
                      <div className="h-90 overflow-hidden rounded-2xl">
                        <img
                          src={memory.image}
                          alt={memory.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="mt-3 text-center text-xs leading-5 text-gray-700">
                        {memory.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.3em] text-rose-400 font-medium mb-3">
                Where Our Memories Live Forever.
              </p>

              <h1 className="text-xl font-semibold text-gray-800">
                ♥️🌸 أنتِ أجملُ صدفةٍ في حياتي.
              </h1>

              <p className="text-sm text-gray-400 mt-3">
                A little secret is waiting for you...
              </p>
            </div>

            {/* Card */}
            <form
              onSubmit={(e) => {
                e.preventDefault();

                if (password === "01-09-26") {
                  setUnlocked(true);

                  toast.success("Two Hearts, One Beautiful Story", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                  });

                  localStorage.setItem("unlocked", JSON.stringify(true));
                } else {
                  alert("Incorrect password. Please try again.");
                }
              }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl shadow-pink-100/50 px-7 py-8"
            >
              <h2 className="text-center text-sm font-medium text-gray-500 mb-6">
                ENTER THE SECRET WORD 🔑
              </h2>

              <input
                type="password"
                placeholder="password"
                className="w-full py-3 bg-transparent border-0 border-b-2 border-gray-200 outline-none text-center text-gray-700 placeholder:text-gray-600 focus:border-rose-400 transition-colors"
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="submit"
                className="w-full mt-8 py-3 rounded-full bg-rose-400 text-white font-medium shadow-md shadow-rose-200 hover:bg-rose-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (password === "01-09-2026") {
                    setUnlocked(true);
                  }
                }}
              >
                Unlock 🔓
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-6">
              Made with love ❤️
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

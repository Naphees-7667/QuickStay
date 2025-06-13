import { use, useEffect, useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../../context/AppContext";
import toast from "react-hot-toast";

function ImagePreview({ file }) {
  const [previewURL, setPreviewURL] = useState("");

  // 🔁 useEffect runs when `file` changes
  useEffect(() => {
    if (!file) return;

    // ✅ Create a blob URL for the file
    const objectUrl = URL.createObjectURL(file);
    setPreviewURL(objectUrl); // Store it for use in <img src=... />

    // 🧹 Clean up the old URL from memory
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]); // Runs every time `file` changes

  return (
    <img
      src={previewURL}
      alt="preview"
      className="max-h-13 cursor-pointer opacity-80"
    />
  );
}

const AddRoom = () => {
  const { axios, getToken } = useAppContext();

  const [image, setImage] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [inputs, setInputs] = useState({
    roomType: "",
    priceperNight: 0,
    amenities: {
      "Free WiFi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  const [loading, setLoading] = useState(false);
  const onSubmitHadler = async (e) => {
    e.preventDefault();
    if (
      !inputs.roomType ||
      !inputs.priceperNight ||
      !inputs.amenities ||
      !Object.values(image).some((img) => img)
    ) {
      toast.error("All fields are required");
      return alert("All fields are required");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("roomType", inputs.roomType);
      formData.append("pricePerNight", inputs.priceperNight);
      // converting amenities into array and keeping only enabled amenities
      const amenities = Object.keys(inputs.amenities).filter(
        (key) => inputs.amenities[key]
      );
      formData.append("amenities", JSON.stringify(amenities));

      // Adding images to from data

      Object.keys(image).forEach((key) => {
        formData.append(`images`, image[key]);
      });

      const { data } = await axios.post("/api/room", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        toast.success(data.message);

        setInputs({
          roomType: "",
          priceperNight: 0,
          amenities: {
            "Free WiFi": false,
            "Free Breakfast": false,
            "Room Service": false,
            "Mountain View": false,
            "Pool Access": false,
          },
        });
        setImage({
          1: null,
          2: null,
          3: null,
          4: null,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHadler}>
      <Title
        align="left"
        title="Add Room"
        subTitle="Fill in the details carefully and accurate room details, pricing, and amenities, to enhance the user booking experience."
        font="outfit"
      />

      {/* upload area for images  */}
      <p className="text-gray-800 mt-10">Images</p>
      <div className="grid grid-cols-2 md:flex gap-4 my-2 flex-wrap">
        {/* Object.keys(image) returns an array: ['img1', 'img2', 'img3'] */}
        {/* You're looping over each key and rendering a file upload section for it. */}

        {Object.keys(image).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            {image[key] ? (
              <ImagePreview file={image[key]} />
            ) : (
              <img
                src={assets.uploadArea}
                alt=""
                className="max-h-13 cursor-pointer opacity-80"
              />
            )}
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              onChange={(e) => setImage({ ...image, [key]: e.target.files[0] })}
              hidden
              required
            />
          </label>
        ))}
      </div>

      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Room Type</p>
          <select
            value={inputs.roomType}
            required
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
            className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full"
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>
        <div className="">
          <p className="mt-4 text-gray-800">
            Price <span className="text-xs">/ night</span>
          </p>
          <input
            onChange={(e) =>
              setInputs({ ...inputs, priceperNight: e.target.value })
            }
            type="text"
            placeholder="0"
            required
            className="border border-gray-300 mt-1 rounded p-2 w-24"
            value={inputs.priceperNight}
          />
        </div>
      </div>

      <p className="text-gray-800 mt-4">Amenities</p>
      <div className="flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <div className="" key={index}>
            <input
              type="checkbox"
              name={amenity}
              id={`amenity${index + 1}`}
              className="mr-2"
              checked={inputs.amenities[amenity]}
              onChange={(e) =>
                setInputs({
                  ...inputs,
                  amenities: {
                    ...inputs.amenities,
                    [amenity]: !inputs.amenities[amenity],
                  },
                })
              }
            />

            <label htmlFor={`amenity${index + 1}`}>{amenity}</label>
          </div>
        ))}
      </div>

      <button className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer disabled={loading}">
        {loading ? "Adding...." : "Add Room"}
      </button>
    </form>
  );
};

export default AddRoom;

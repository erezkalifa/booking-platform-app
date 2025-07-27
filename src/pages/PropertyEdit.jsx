import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { propertyService } from "../services/property.service";
import { showErrorMsg, showSuccessMsg } from "../services/event-bus.service";

export function PropertyEdit() {
  const [property, setProperty] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
  });

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadProperty();
  }, []);

  async function loadProperty() {
    try {
      if (params.id) {
        const property = await propertyService.getById(params.id);
        setProperty(property);
      }
    } catch (err) {
      showErrorMsg("Failed to load property details");
      navigate("/property");
    }
  }

  function handleChange(ev) {
    const { name, value } = ev.target;
    setProperty((prevProperty) => ({
      ...prevProperty,
      [name]: value,
    }));
  }

  async function onSaveProperty(ev) {
    ev.preventDefault();
    try {
      await propertyService.save(property);
      showSuccessMsg("Property saved successfully!");
      navigate("/property");
    } catch (err) {
      showErrorMsg("Failed to save property");
    }
  }

  return (
    <section className="property-edit">
      <h2>{params.id ? "Edit Property" : "Add New Property"}</h2>
      <form onSubmit={onSaveProperty}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={property.title}
            onChange={handleChange}
            placeholder="Property title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={property.price}
            onChange={handleChange}
            placeholder="Price per night"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={property.location}
            onChange={handleChange}
            placeholder="Property location"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={property.description}
            onChange={handleChange}
            placeholder="Property description"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save">
            Save Property
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/property")}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

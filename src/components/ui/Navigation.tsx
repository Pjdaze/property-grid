import { NavLink } from "react-router-dom";

export function Navigation() {
  return (
    <nav
      className="bg-gray-700 p-3 w-[95%] rounded-lg mx-auto my-4"
      aria-label="Main navigation"
    >
      <ul className="flex gap-2 list-none m-0 p-0">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `inline-block px-3 py-2 rounded-md font-${
                isActive ? "bold" : "normal"
              } text-${isActive ? "white" : "blue-600"} bg-${
                isActive ? "blue-600" : "transparent"
              }`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `inline-block px-3 py-2 rounded-md font-${
                isActive ? "bold" : "normal"
              } text-${isActive ? "white" : "blue-600"} bg-${
                isActive ? "blue-600" : "transparent"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

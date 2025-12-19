import React, { useState } from "react";

const MegaMenu = () => {
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  const menu = [
    {
      name: "Education",
      submenu: [
        {
          name: "Technical Education",
          submenu: [
            { name: "Polytechnic" },
            { name: "ITI" },
            { name: "Diploma Courses" },
          ],
        },
        {
          name: "School",
          submenu: [
            { name: "Primary School" },
            { name: "High School" },
            { name: "Senior Secondary" },
          ],
        },
      ],
    },
    { name: "About Us" },
    { name: "Contact" },
  ];

  return (
    <div style={{ background: "#eee", padding: "10px" }}>
      <ul style={{ listStyle: "none", display: "flex", gap: "20px" }}>
        {menu.map((item, i) => (
          <li
            key={i}
            style={{ position: "relative", cursor: "pointer" }}
            onMouseEnter={() => setActiveMain(i)}
            onMouseLeave={() => {
              setActiveMain(null);
              setActiveSub(null);
            }}
          >
            {item.name}

            {/* FIRST LEVEL SUBMENU */}
            {item.submenu && activeMain === i && (
              <ul
                style={{
                  position: "absolute",
                  left: 0,
                  top: "25px",
                  background: "#fff",
                  padding: "10px 0",
                  listStyle: "none",
                  width: "180px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                {item.submenu.map((sub, j) => (
                  <li
                    key={j}
                    style={{ padding: "8px 12px", position: "relative" }}
                    onMouseEnter={() => setActiveSub(j)}
                  >
                    {sub.name}

                    {/* SECOND LEVEL SUBMENU */}
                    {sub.submenu && activeSub === j && (
                      <ul
                        style={{
                          position: "absolute",
                          left: "180px",
                          top: 0,
                          background: "#fff",
                          padding: "10px 0",
                          listStyle: "none",
                          width: "180px",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        {sub.submenu.map((s, k) => (
                          <li
                            key={k}
                            style={{ padding: "8px 12px" }}
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MegaMenu;

import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// Describes the shape of one course returned by the course API.
type Course = {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

// Props exposed through Framer property controls.
type Props = {
    accentColor: string
    cardRadius: number
}

// Main Framer Code Component. React state and API logic live inside this component.
function Skillpath(props: Props) {
    // Stores the courses returned by the API. Starts empty before the request completes.
    const [courses, setCourses] = useState<Course[]>([])
    // Stores the country code used to decide how prices should be displayed.
    const [country, setCountry] = useState<string | null>(null)

    // Tracks whether the course request is currently in progress.
    const [loading, setLoading] = useState(true)
    // Tracks whether the course API failed. A course API failure prevents the course list from rendering.
    const [error, setError] = useState(false)
    // Tracks country API failure separately so courses can still be displayed without prices.
    const [priceError, setPriceError] = useState(false)

    // Fetches the course data first, then attempts to fetch the country used for price formatting.
    async function getCourses() {
        setLoading(true)
        setError(false)
        setPriceError(false)

        try {
            const courseResponse = await fetch(
                "https://syncsphere-hiv6.onrender.com/assignment/course-data"
            )

            // fetch() does not throw for HTTP 4xx/5xx responses, so check response.ok explicitly.
            if (!courseResponse.ok) {
                throw new Error("Unable to load courses")
            }

            // Parse the JSON response and tell TypeScript that it is an array of Course objects.
            const courseData: Course[] = await courseResponse.json()

            // Updating state causes React to re-render the component with the fetched courses.
            setCourses(courseData)

            try {
                // The country request is secondary: failure here should not hide successfully loaded courses.
                const countryResponse = await fetch(
                    "https://syncsphere-hiv6.onrender.com/assignment/country-code"
                )

                if (!countryResponse.ok) {
                    throw new Error("Unable to load country")
                }

                const countryData = await countryResponse.json()

                setCountry(countryData.country_code)
            } catch {
                setPriceError(true)
            }
        } catch {
            setError(true)
            setCourses([])
        } finally {
            // Stop showing the loading state whether the request succeeded or failed.
            setLoading(false)
        }
    }

    // Run the initial data fetch when the component mounts. The empty dependency array prevents repeated fetching on re-renders.
    useEffect(() => {
        getCourses()
    }, [])

    // Converts the API price into the format required by the user’s country.
    function formatPrice(course: Course) {
        if (priceError || !country) {
            return "Price temporarily unavailable"
        }

        // Indian prices are supplied in paise, so divide by 100 to get rupees.
        if (country === "IN") {
            return `₹${(course.pricePaise / 100).toLocaleString("en-IN")}`
        }

        // US prices are supplied in cents, so divide by 100 to get dollars.
        if (country === "US") {
            return `$${(course.priceUsdCents / 100).toFixed(2)}`
        }

        return "Price temporarily unavailable"
    }

    // Render the complete Skillpath page: hero, course states/list, and footer.
    return (
        <div
            className="skillpath"
            style={{
                width: "100%",
                minWidth: 0,
            }}
        >
            // Component-scoped CSS for layout, typography, responsive behavior, and visual styling.
            <style>{`

            @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap");

* {
    box-sizing: border-box;
}

html,
body,
#root {
    width: 100%;
    margin: 0;
    padding: 0;
}

body {
    font-family: "Inter", sans-serif;
    color: #111827;
    background: #ffffff;
}

button {
    font-family: inherit;
}

/* =========================
   MAIN
   ========================= */

.skillpath {
    width: 100%;
    margin: 0;
    padding: 0;
    background: #ffffff;
    overflow-x: hidden;
}

/* =========================
   HERO
   ========================= */

.hero {
    width: 100%;
    min-height: 560px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 80px 24px;
    text-align: center;

    color: #ffffff;
}

.hero-content {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
}

.hero-label {
    margin: 0 0 16px;

    font-family: "Space Grotesk", sans-serif;
    font-size: 25px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;

    color: rgba(255, 255, 255, 0.78);
}

.hero h1 {
    margin: 0;

    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(48px, 7vw, 78px);
    line-height: 0.98;
    letter-spacing: -0.055em;
    font-weight: 700;
}

.hero-description {
    max-width: 560px;
    margin: 28px auto 34px;

    font-size: 18px;
    line-height: 1.6;

    color: rgba(255, 255, 255, 0.82);
}

.hero-button {
    padding: 15px 26px;

    border: none;
    border-radius: 12px;

    background: #ffffff;
    color: #5b3df5;

    font-size: 15px;
    font-weight: 700;

    cursor: pointer;

    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.hero-button:hover {
    transform: translateY(-3px);

    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.2);
}

/* =========================
   COURSES
   ========================= */

#courses {
    width: 100%;
    padding: 0 0 40px;
}

.courses-title {
    width: min(1200px, calc(100% - 48px));

    margin: 0 auto;
    padding: 80px 0 36px;

    font-family: "Space Grotesk", sans-serif;
    font-size: clamp(32px, 4vw, 46px);
    line-height: 1.1;
    letter-spacing: -0.04em;
    font-weight: 700;

    text-align: center;
    color: #111827;
}

/* =========================
   COURSE GRID
   ========================= */

.courses-grid {
    width: min(1200px, calc(100% - 48px));

    margin: 0 auto;

    display: grid;

    grid-template-columns: repeat(3, minmax(0, 1fr));

    gap: 30px;
}

/* =========================
   COURSE CARD
   ========================= */

.course-card {
    min-width: 0;
    min-height: 280px;

    padding: 28px;

    display: flex;
    flex-direction: column;
    align-items: flex-start;

    border: 2px solid #e8e5ff;

    background: #ffffff;

    box-shadow: 0 4px 12px rgba(17, 24, 39, 0.04);

    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
}

.course-card:hover {
    transform: translateY(-5px);

    border-color: #c9beff;

    box-shadow: 0 18px 40px rgba(108, 77, 255, 0.12);
}

/* =========================
   CATEGORY / TYPE
   ========================= */

.category-type {
    width: 100%;

    display: flex;
    justify-content: space-between;
    align-items: center;

    gap: 12px;
}

.course-category {
    margin-bottom: 14px;

    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;

    color: #6c4dff;
}

.course-type {
    margin-bottom: 14px;

    font-size: 13px;
    color: #777777;

    white-space: nowrap;
}

/* =========================
   COURSE CONTENT
   ========================= */

.course-card h2 {
    width: 100%;
    margin: 0;

    font-family: "Space Grotesk", sans-serif;
    font-size: 23px;
    line-height: 1.25;
    letter-spacing: -0.025em;
    font-weight: 600;

    color: #111827;
}

.course-description {
    width: 100%;

    margin: 12px 0 0;

    color: #6b7280;

    font-size: 14px;
    line-height: 1.6;

    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    overflow: hidden;
}

/* =========================
   REFUNDABLE
   ========================= */

.refundable-badge {
    display: inline-block;
    width: fit-content;

    margin-top: 14px;
    padding: 6px 10px;

    border-radius: 999px;

    background: #e8fff3;
    color: #087443;

    font-size: 11px;
    font-weight: 700;
}

/* =========================
   PRICE
   ========================= */

.course-price {
    align-self: center;

    margin-top: auto;
    padding-bottom: 16px;

    font-family: "Space Grotesk", sans-serif;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 700;

    color: #111827;
}

/* =========================
   LOADING / ERROR
   ========================= */

.course-message {
    width: min(1200px, calc(100% - 48px));

    margin: 0 auto;
    padding: 60px 24px;

    text-align: center;

    color: #666666;

    font-size: 18px;
    font-weight: 500;
}

.course-message p {
    margin: 0 0 18px;
}

.course-message button {
    padding: 11px 20px;

    border: none;
    border-radius: 8px;

    background: #6c4dff;
    color: #ffffff;

    font-size: 14px;
    font-weight: 600;

    cursor: pointer;
}

/* =========================
   FOOTER
   ========================= */

.footer {
    margin-top: 80px;
    padding: 56px 24px 32px;

    border-top: 1px solid #e5e7eb;

    text-align: center;
}

.footer-links {
    display: flex;
    justify-content: center;
    align-items: center;

    gap: 32px;

    margin-bottom: 24px;
}

.footer-links a {
    color: #333333;

    font-size: 14px;
    text-decoration: none;
}

.footer-links a:hover {
    text-decoration: underline;
}

.footer-copyright {
    margin: 0;

    color: #999999;

    font-size: 13px;
}

/* =========================
   TABLET
   3 → 2 COLUMNS
   ========================= */

@media (max-width: 900px) {

    .hero {
        min-height: 500px;
        padding: 70px 24px;
    }

    .courses-title {
        width: calc(100% - 40px);
        padding-top: 64px;
    }

    .courses-grid {
        width: calc(100% - 40px);

        grid-template-columns: repeat(2, minmax(0, 1fr));

        gap: 20px;
    }

    .course-card {
        min-height: 300px;
        padding: 22px;
    }
}

/* =========================
   MOBILE
   2 → 1 COLUMN
   ========================= */

@media (max-width: 600px) {

    .hero {
        min-height: 480px;
        padding: 60px 20px;
    }

    .hero-label {
        margin-bottom: 16px;
        font-size: 12px;
    }

    .hero h1 {
        font-size: 44px;
        line-height: 1.04;
    }

    .hero-description {
        margin: 22px auto 28px;
        font-size: 16px;
        line-height: 1.5;
    }

    .hero-button {
        width: 100%;
        max-width: 260px;
        padding: 14px 20px;
    }

    /* COURSES */

    .courses-title {
        width: calc(100% - 32px);

        padding: 56px 0 28px;

        font-size: 32px;
    }

    .courses-grid {
        width: calc(100% - 32px);

        grid-template-columns: 1fr;

        gap: 16px;
    }

    /* CARDS */

    .course-card {
        min-height: 280px;
        padding: 22px;
    }

    .course-card h2 {
        font-size: 21px;
    }

    .course-description {
        font-size: 14px;
    }

    .course-price {
        font-size: 20px;
    }

    /* MESSAGE */

    .course-message {
        width: calc(100% - 32px);
        padding: 48px 16px;
    }

    /* FOOTER */

    .footer {
        margin-top: 60px;
        padding: 48px 20px 28px;
    }

    .footer-links {
        flex-direction: column;
        gap: 16px;
    }
}

/* =========================
   VERY SMALL PHONES
   ========================= */

@media (max-width: 380px) {

    .hero h1 {
        font-size: 38px;
    }

    .hero-description {
        font-size: 15px;
    }

    .courses-title {
        font-size: 28px;
    }
}
   
            `}</style>

            {/* =========================
               HERO
               ========================= */}

            <section
                className="hero"
                style={{
                    background: props.accentColor,
                }}
            >
                <div className="hero-content">
                    <p className="hero-label">SKILLPATH</p>

                    <h1>
                        Learn skills.
                        <br />
                        Build your path.
                    </h1>

                    <p className="hero-description">
                        Practical courses for ambitious learners who want to
                        build real skills and create their own path.
                    </p>

                    <button
                        className="hero-button"
                        onClick={() => {
                            document.getElementById("courses")?.scrollIntoView({
                                behavior: "smooth",
                            })
                        }}
                    >
                        Explore Courses
                    </button>
                </div>
            </section>

            {/* =========================
               COURSES
               ========================= */}

            <section id="courses">
                <h2 className="courses-title">Explore our courses</h2>

                {/* Loading state shown while the course API request is running. */}

                {loading && (
                    <div className="course-message">
                        <p>Loading courses...</p>
                    </div>
                )}

                {/* Error state shown when the course API fails, with a Retry action. */}

                {!loading && error && (
                    <div className="course-message">
                        <p>Unable to load courses.</p>

                        <button onClick={getCourses}>Retry</button>
                    </div>
                )}

                {/* Empty state shown when the API succeeds but returns no courses. */}

                {!loading && !error && courses.length === 0 && (
                    <div className="course-message">
                        <p>No courses available right now.</p>

                        <button onClick={getCourses}>Retry</button>
                    </div>
                )}

                {/* Course grid shown only after loading succeeds and at least one course exists. */}

                {!loading && !error && courses.length > 0 && (
                    <div className="courses-grid">
                        {/* map() creates one card for each course in the API response. */}
                        {courses.map((course) => (
                            <div
                                className="course-card"
                                // courseCode uniquely identifies each course, so it is used as React’s list key.
                                key={course.courseCode}
                                style={{
                                    borderRadius: props.cardRadius,
                                }}
                            >
                                <div className="category-type">
                                    <div className="course-category">
                                        {course.mainCategory}
                                    </div>

                                    <div className="course-type">
                                        {course.courseType}
                                    </div>
                                </div>

                                <h2>{course.courseName}</h2>

                                <p className="course-description">
                                    {course.description}
                                </p>

                                {/* Render the badge only when refundable is true. */}
                                {course.refundable && (
                                    <span className="refundable-badge">
                                        Refundable
                                    </span>
                                )}

                                <strong className="course-price">
                                    // Price display is delegated to formatPrice() so currency logic stays outside the JSX.
                                    {formatPrice(course)}
                                </strong>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* =========================
               FOOTER
               ========================= */}

            <footer className="footer">
                <div className="footer-links">
                    <a href="#">About</a>

                    <a href="#courses">Courses</a>

                    <a href="#">Contact</a>
                </div>

                <p className="footer-copyright">
                    © 2026 Skillpath. All rights reserved.
                </p>
            </footer>
        </div>
    )
}

export default Skillpath

/* =========================
   FRAMER PROPERTY CONTROLS
   ========================= */

// Expose selected visual properties to designers in the Framer property panel.
addPropertyControls(Skillpath, {
    // Controls the hero accent/background color.
    accentColor: {
        type: ControlType.Color,
        title: "Accent Color",
        defaultValue: "#6C4DFF",
    },

    // Controls the rounded corners used by course cards.
    cardRadius: {
        type: ControlType.Number,
        title: "Card Radius",
        defaultValue: 16,
        min: 0,
        max: 40,
        step: 1,
    },
})

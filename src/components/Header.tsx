/**
 * Header Component
 *
 * Renders the CSU header using semantic class names from csu-global.css.
 * This component matches the exported HTML structure exactly.
 */

// Navigation menu data structure
const navigationItems = [
  {
    label: 'Academics',
    image: 'https://www.columbiasouthern.edu/media/ljqikvoz/thumbnail-academics.jpg',
    imageAlt: 'Young graduate smiles with fellow graduates in the background',
    links: [
      { label: 'View All Programs', href: 'https://www.columbiasouthern.edu/online-degree/view-all-programs/' },
      { label: 'Continuing Education', href: 'https://www.columbiasouthern.edu/online-degree/continuing-education/' },
      { label: 'Full Course Listing', href: 'https://www.columbiasouthern.edu/online-degree/full-course-listing/' },
      { label: 'Doctoral Overview', href: 'https://www.columbiasouthern.edu/online-degree/doctoral-overview/' },
      { label: 'Colleges and Faculty', href: 'https://www.columbiasouthern.edu/online-degree/colleges-and-faculty/' },
      { label: 'Transfer Credit to CSU', href: 'https://www.columbiasouthern.edu/online-degree/transfer-credit-to-csu/' },
      { label: 'General Education', href: 'https://www.columbiasouthern.edu/online-degree/general-education/' },
      { label: 'Certificate Programs', href: 'https://www.columbiasouthern.edu/online-degree/certificates/' },
      { label: 'Academic Calendar', href: 'https://www.columbiasouthern.edu/online-degree/academic-calendar/' },
      { label: 'Commencement', href: 'https://www.columbiasouthern.edu/online-degree/commencement/' },
      { label: 'Summer College Credit Program', href: 'https://www.columbiasouthern.edu/online-degree/summer-college-credit-program/' },
      { label: "Accelerated Bachelor to Master's", href: 'https://www.columbiasouthern.edu/online-degree/accelerated-bachelor-to-masters/' },
    ],
  },
  {
    label: 'Admissions',
    image: 'https://www.columbiasouthern.edu/media/upff0sp2/thumbnail-admissions.jpg',
    imageAlt: 'Student and admissions counselor look at a laptop together',
    links: [
      { label: 'Getting Started', href: 'https://www.columbiasouthern.edu/admissions/getting-started/' },
      { label: 'Online Learning Experience', href: 'https://www.columbiasouthern.edu/admissions/online-learning-experience/' },
      { label: 'Graduation Calculator', href: 'https://www.columbiasouthern.edu/admissions/graduation-calculator/' },
      { label: 'Requirements', href: 'https://www.columbiasouthern.edu/admissions/requirements/' },
      { label: 'Transfer Credit', href: 'https://www.columbiasouthern.edu/admissions/transfer-credit/' },
      { label: 'International Transfer Credit', href: 'https://www.columbiasouthern.edu/admissions/international-transfer-credit/' },
      { label: 'Admissions FAQs', href: 'https://www.columbiasouthern.edu/admissions/admissions-faqs/' },
    ],
  },
  {
    label: 'Student Support',
    image: 'https://www.columbiasouthern.edu/media/0xqf0leo/thumbnail-resources.jpg',
    imageAlt: 'Support representative smiling',
    links: [
      { label: 'Support Overview', href: 'https://www.columbiasouthern.edu/student-support/support-overview/' },
      { label: 'Registrar', href: 'https://www.columbiasouthern.edu/student-support/registrar/' },
      { label: 'Student Resolution', href: 'https://www.columbiasouthern.edu/student-support/student-resolution/' },
      { label: 'Career Services', href: 'https://www.columbiasouthern.edu/student-support/career-services/' },
      { label: 'Student Community', href: 'https://www.columbiasouthern.edu/student-support/student-community/' },
      { label: 'Disability Services', href: 'https://www.columbiasouthern.edu/student-support/disability-services/' },
      { label: 'Online Library', href: 'https://www.columbiasouthern.edu/student-support/online-library/' },
      { label: 'Student FAQs', href: 'https://www.columbiasouthern.edu/student-support/student-faqs/' },
      { label: 'Importance of Advising', href: 'https://www.columbiasouthern.edu/student-support/importance-of-advising/' },
    ],
  },
  {
    label: 'Tuition & Financing',
    image: 'https://www.columbiasouthern.edu/media/zudbm5ev/thumbnail-tuition.jpg',
    imageAlt: 'Jar of coins labelled Education with graduation cap resting against it',
    links: [
      { label: 'Tuition Overview', href: 'https://www.columbiasouthern.edu/tuition-financing/tuition-overview/' },
      { label: 'Cost Comparison Calculator', href: 'https://www.columbiasouthern.edu/tuition-financing/cost-comparison-calculator/' },
      { label: 'Federal Student Aid', href: 'https://www.columbiasouthern.edu/tuition-financing/federal-student-aid/' },
      { label: 'Payment Options', href: 'https://www.columbiasouthern.edu/tuition-financing/payment-options/' },
      { label: 'Scholarships', href: 'https://www.columbiasouthern.edu/tuition-financing/scholarships/' },
      { label: 'Tuition & Fees Payment Policy', href: 'https://www.columbiasouthern.edu/tuition-financing/tuition-fees-payment-policy/' },
      { label: 'Student Fees', href: 'https://www.columbiasouthern.edu/tuition-financing/student-fees/' },
      { label: 'Tuition Refund Policy', href: 'https://www.columbiasouthern.edu/tuition-financing/tuition-refund-policy/' },
      { label: 'Partnerships', href: 'https://www.columbiasouthern.edu/tuition-financing/partnerships/' },
      { label: 'Tuition & Financing FAQs', href: 'https://www.columbiasouthern.edu/tuition-financing/tuition-financing-faqs/' },
      { label: 'Financial Literacy', href: 'https://www.columbiasouthern.edu/tuition-financing/financial-literacy/' },
    ],
  },
  {
    label: 'About',
    image: 'https://www.columbiasouthern.edu/media/qimp2eni/thumbnail-about.jpg',
    imageAlt: 'Columbia Southern University facade against blue sky',
    links: [
      { label: 'About CSU', href: 'https://www.columbiasouthern.edu/about-csu/about-csu/' },
      { label: 'State Authorization and Accreditation', href: 'https://www.columbiasouthern.edu/about-csu/accreditation-licensure/' },
      { label: 'Leadership', href: 'https://www.columbiasouthern.edu/about-csu/leadership/' },
      { label: 'Board of Trustees', href: 'https://www.columbiasouthern.edu/about-csu/board-of-trustees/' },
      { label: 'CSU Cares', href: 'https://www.columbiasouthern.edu/about-csu/csu-cares/' },
      { label: 'Press Room', href: 'https://www.columbiasouthern.edu/about-csu/media/' },
      { label: 'Contact Us', href: 'https://www.columbiasouthern.edu/about-csu/contact-us/' },
      { label: 'History', href: 'https://www.columbiasouthern.edu/about-csu/history/' },
      { label: 'The Link Blog', href: 'https://www.columbiasouthern.edu/about-csu/the-link-blog/' },
    ],
  },
  {
    label: 'Military',
    image: 'https://www.columbiasouthern.edu/media/kokpc40q/thumbnail-military.jpg',
    imageAlt: 'Military student greets advisor with handshake',
    links: [
      { label: 'College of Space, Intelligence, and Military Operations', href: 'https://www.columbiasouthern.edu/military/college-of-space-intelligence-and-military-operations/' },
      { label: 'Continuing Education', href: 'https://www.columbiasouthern.edu/military/continuing-education/' },
      { label: 'Military Tuition Information', href: 'https://www.columbiasouthern.edu/military/military-tuition-information/' },
      { label: 'Military Transfer Pathways', href: 'https://www.columbiasouthern.edu/military/military-transfer-pathways/' },
      { label: 'Veterans Center', href: 'https://www.columbiasouthern.edu/military/veterans-center/' },
      { label: 'Branch Resources', href: 'https://www.columbiasouthern.edu/military/branch-resources/' },
      { label: 'Military Spouses', href: 'https://www.columbiasouthern.edu/military/military-spouses/' },
      { label: 'Military FAQs', href: 'https://www.columbiasouthern.edu/military/military-faqs/' },
    ],
  },
  {
    label: 'Careers',
    image: 'https://www.columbiasouthern.edu/media/ayzf5hf1/careers-staff.jpg',
    imageAlt: 'smiling young women',
    links: [
      { label: 'Careers Overview', href: 'https://www.columbiasouthern.edu/careers/careers-overview/' },
      { label: 'Staff Careers', href: 'https://www.columbiasouthern.edu/careers/staff-careers/' },
      { label: 'Faculty Careers', href: 'https://www.columbiasouthern.edu/careers/faculty-careers/' },
    ],
  },
];

interface HeaderProps {
  showMobileCta?: boolean;
  showUtilityNav?: boolean;
  showGlobalMenu?: boolean;
  logoUrl?: string;
  logoAlt?: string;
  /** Render simplified version for preview (no dropdowns) */
  previewMode?: boolean;
}

export function Header({
  showMobileCta = true,
  showUtilityNav = true,
  showGlobalMenu = true,
  logoUrl = 'https://www.columbiasouthern.edu/media/vhgldcbo/csu-logo-horizontal-white.png',
  logoAlt = 'Columbia Southern University logo, homepage',
  previewMode = false,
}: HeaderProps) {
  return (
    <header>
      {/* Mobile CTA - visible on mobile only */}
      {showMobileCta && (
        <div className="dark mobile-cta">
          <ul className="button-group flex stretch">
            <li>
              <a
                className="button ghost"
                href="https://mycsu.columbiasouthern.edu/prospect/application"
                target={previewMode ? '_blank' : undefined}
                rel={previewMode ? 'noopener noreferrer' : undefined}
              >
                Apply Now
              </a>
            </li>
            <li>
              <a
                className="button solid"
                href="https://www.columbiasouthern.edu/info-form"
                target={previewMode ? '_blank' : undefined}
                rel={previewMode ? 'noopener noreferrer' : undefined}
              >
                Request Info
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* Utility Navigation */}
      {showUtilityNav && (
        <div className="dark utility-navigation">
          <div className="site-wrap flex">
            <div className="site-logo">
              <a
                href="https://www.columbiasouthern.edu/"
                target={previewMode ? '_blank' : undefined}
                rel={previewMode ? 'noopener noreferrer' : undefined}
              >
                <img src={logoUrl} alt={logoAlt} />
              </a>
            </div>
            <ul className="button-group flex">
              <li>
                <a className="button" href="tel:+18009778449">
                  800-977-8449
                </a>
              </li>
              <li>
                <a
                  className="button"
                  href="https://www.columbiasouthern.edu/login"
                  target={previewMode ? '_blank' : undefined}
                  rel={previewMode ? 'noopener noreferrer' : undefined}
                >
                  Login Options
                </a>
              </li>
              <li>
                <a
                  className="button ghost"
                  href="https://mycsu.columbiasouthern.edu/prospect/application"
                  target={previewMode ? '_blank' : undefined}
                  rel={previewMode ? 'noopener noreferrer' : undefined}
                >
                  Apply Now
                </a>
              </li>
              <li>
                <a
                  className="button solid"
                  href="https://www.columbiasouthern.edu/info-form"
                  target={previewMode ? '_blank' : undefined}
                  rel={previewMode ? 'noopener noreferrer' : undefined}
                >
                  Request Info
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Global Navigation */}
      {showGlobalMenu && (
        <div className="light">
          <nav className="navigation-wrapper site-wrap flex">
            <div className="mobile-site-logo">
              <a
                href="https://www.columbiasouthern.edu/"
                target={previewMode ? '_blank' : undefined}
                rel={previewMode ? 'noopener noreferrer' : undefined}
              >
                <img
                  src="https://www.columbiasouthern.edu/media/campm3vj/csu-logo-horizontal.png"
                  alt="Columbia Southern University logo, homepage"
                />
              </a>
            </div>
            <button
              id="mobileMenuToggle"
              className="mobile-menu"
              aria-expanded="false"
              aria-haspopup="true"
              type="button"
            >
              <span className="offscreen">Menu</span>
              <i className="icon" role="presentation">
                <svg
                  className="hamburger"
                  xmlns="http://www.w3.org/2000/svg"
                  height="22"
                  viewBox="0 0 30 22"
                >
                  <title>Menu icon</title>
                  <g fill="#fff">
                    <path
                      className="bar top"
                      d="M27.93,8.93H2.07A2,2,0,0,0,0,11a2,2,0,0,0,2.07,2.07H27.93A2,2,0,0,0,30,11,2,2,0,0,0,27.93,8.93Z"
                    />
                    <path
                      className="bar middle"
                      d="M27.93,8.93H2.07A2,2,0,0,0,0,11a2,2,0,0,0,2.07,2.07H27.93A2,2,0,0,0,30,11,2,2,0,0,0,27.93,8.93Z"
                    />
                    <path
                      className="bar bottom"
                      d="M27.93,8.93H2.07A2,2,0,0,0,0,11a2,2,0,0,0,2.07,2.07H27.93A2,2,0,0,0,30,11,2,2,0,0,0,27.93,8.93Z"
                    />
                  </g>
                </svg>
              </i>
            </button>
            <div className="flex">
              <ul className="site-navigation">
                {navigationItems.map((item) => (
                  <li key={item.label}>
                    <button className="toggle" aria-expanded="false" type="button">
                      {item.label}
                    </button>
                    {!previewMode && (
                      <div className="dropdown grid grid-gap-20 columns-1-2" data-breakpoints="650">
                        <div className="column dark">
                          <div className="image fit-image">
                            <img alt={item.imageAlt} src={item.image} />
                          </div>
                          <div className="text-overlay gradient-bottom">
                            <div className="text">
                              <strong className="h5">{item.label}</strong>
                            </div>
                          </div>
                        </div>
                        <ul className="self-center">
                          {item.links.map((link) => (
                            <li key={link.href}>
                              <a href={link.href} className="arrow-link reveal">
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mobile-utility-navigation">
                <ul>
                  <li>
                    <a href="tel:+18009778449" className="arrow-link reveal">
                      800-977-8449
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.columbiasouthern.edu/login"
                      className="arrow-link reveal"
                      target={previewMode ? '_blank' : undefined}
                      rel={previewMode ? 'noopener noreferrer' : undefined}
                    >
                      Login Options
                    </a>
                  </li>
                </ul>
              </div>
              <div className="site-search">
                <button
                  id="desktopSearchToggle"
                  className="toggle"
                  data-selector="#siteNav"
                  aria-expanded="false"
                  type="button"
                >
                  <span className="offscreen">Open Search</span>
                  <i className="icon" role="presentation">
                    <svg
                      className="search-open"
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      viewBox="0 0 20 20"
                    >
                      <title>Search icon</title>
                      <g>
                        <path
                          className="cls-1"
                          d="M19.51,17.15,15.17,12.8l-.08-.06a8.25,8.25,0,1,0-2.35,2.35l.06.08,4.35,4.34a1.67,1.67,0,0,0,2.36-2.36ZM8.22,13.59a5.37,5.37,0,1,1,5.37-5.37A5.37,5.37,0,0,1,8.22,13.59Z"
                          transform="translate(0 0)"
                        />
                      </g>
                    </svg>
                  </i>
                  <i className="icon" role="presentation">
                    <svg
                      className="search-close"
                      xmlns="http://www.w3.org/2000/svg"
                      height="18"
                      viewBox="0 0 18 18"
                    >
                      <title>Close search</title>
                      <g>
                        <path
                          className="cls-1"
                          d="M15.17,12.8,12.36,10l6.15-6.15a1.67,1.67,0,0,0-2.36-2.36L12.8,4.83,10,7.64,3.85,1.49A1.67,1.67,0,0,0,1.49,3.85L4.83,7.2,7.64,10,1.49,16.15a1.67,1.67,0,0,0,2.36,2.36L7.2,15.17,10,12.36l6.15,6.15a1.67,1.67,0,0,0,2.36-2.36Z"
                          transform="translate(-1 -1)"
                        />
                      </g>
                    </svg>
                  </i>
                </button>
                <div className="search-box">
                  <div className="nav-overlay"></div>
                  <div className="search-query">
                    <form
                      role="search"
                      action="https://www.columbiasouthern.edu/search/"
                      method="get"
                    >
                      <label htmlFor="CSUSiteSearch">
                        <span className="offscreen">What can we help you search for?</span>
                      </label>
                      <input
                        id="CSUSiteSearch"
                        name="query"
                        maxLength={1000}
                        className="form-control"
                        type="search"
                      />
                      <button id="CSUSiteSearchButton" className="search-button" type="submit">
                        <i className="icon search-icon" role="presentation">
                          <svg
                            className="search"
                            xmlns="http://www.w3.org/2000/svg"
                            height="20"
                            viewBox="0 0 20 20"
                          >
                            <title>Search icon</title>
                            <g>
                              <path
                                className="cls-1"
                                d="M19.51,17.15,15.17,12.8l-.08-.06a8.25,8.25,0,1,0-2.35,2.35l.06.08,4.35,4.34a1.67,1.67,0,0,0,2.36-2.36ZM8.22,13.59a5.37,5.37,0,1,1,5.37-5.37A5.37,5.37,0,0,1,8.22,13.59Z"
                                transform="translate(0 0)"
                              />
                            </g>
                          </svg>
                        </i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;

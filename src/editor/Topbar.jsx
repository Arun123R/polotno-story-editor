import { observer } from 'mobx-react-lite';
import './Topbar.css';

import { ThemeToggleButton } from './ThemeToggleButton';

export const Topbar = observer(({ projectName = 'Campaign Name', toolbar }) => {
    const handlePreview = () => {
        // Preview functionality - can be implemented based on your needs
        console.log('Preview clicked');
    };

    const handlePublish = () => {
        // Publish functionality - can be implemented based on your needs
        console.log('Publish clicked');
    };

    return (
        <div className="topbar">
            {/* Left Section - Logo and Breadcrumbs */}
            <div className="topbar-left">
                {/* Logo */}
                <div className="topbar-logo">
                    <img
                        src="/AppStorys_logo_white-Dy7IWqWA.png"
                        alt="AppStories Logo"
                        style={{ height: "37px", width: "auto" }}
                    />
                </div>

                {/* Breadcrumb Navigation */}
                <div className="topbar-breadcrumb">
                    <button className="breadcrumb-group-selector" title="Switch Group">
                        <div className="group-avatar-preview">
                            <img
                                src="https://db62cod6cnasq.cloudfront.net/user-media/15044/sg268209/3429895945.png"
                                alt="Group"
                            />
                        </div>
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="group-chevron-static"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>


                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item breadcrumb-current">{projectName}</span>
                </div>
            </div>

            {/* Right Section - Status and Actions */}
            <div className="topbar-right">
                {/* Save Status */}
                {/* <div className="topbar-status">
                    <span className="status-text">All changes saved</span>
                    <span className="status-dot">•</span>
                    <span className="status-text status-muted">Auto-saved</span>
                </div> */}

                {/* Action Buttons */}
                <div className="topbar-actions">
                    {toolbar}
                    <ThemeToggleButton />
                    <button className="topbar-btn topbar-btn-secondary" onClick={handlePreview}>
                        {/* <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg> */}
                        <span>Cancle</span>
                    </button>



                    <button className="topbar-btn topbar-btn-primary" onClick={handlePublish}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
});

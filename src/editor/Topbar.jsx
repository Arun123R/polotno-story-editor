import { observer } from 'mobx-react-lite';
import { useState, useEffect } from 'react';
import './Topbar.css';

import { ThemeToggleButton } from './ThemeToggleButton';
import { handleSave } from '../utils/canvasSave.js';
import { createStoryGroup } from '../services/groupService.js';

export const Topbar = observer(({ store, projectName = 'Campaign Name', toolbar, groupId: propGroupId, slideId }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState(propGroupId || 'demo-group-id');
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);

    // Disabled auto-create group to prevent 401 errors
    // Uncomment this when you have auth tokens set
    /*
    useEffect(() => {
        const initializeGroup = async () => {
            if (propGroupId) {
                console.log('📁 Using provided groupId:', propGroupId);
                setCurrentGroupId(propGroupId);
                return;
            }

            console.log('📁 No groupId provided, creating new story group...');
            setIsCreatingGroup(true);

            try {
                const result = await createStoryGroup({
                    name: projectName || 'New Story Campaign',
                    description: 'Created from Polotno Editor',
                    isActive: true,
                });

                if (result.success && result.groupId) {
                    const newGroupId = result.groupId;
                    console.log('✅ Story group created with ID:', newGroupId);
                    setCurrentGroupId(newGroupId);
                } else {
                    console.error('❌ Failed to create story group:', result.error);
                    console.warn('⚠️ Using fallback groupId: demo-group-id');
                    setCurrentGroupId('demo-group-id');
                    alert(`Failed to create story group: ${result.error}\nUsing fallback group ID.`);
                }
            } catch (error) {
                console.error('❌ Error creating story group:', error);
                console.error('❌ Error details:', error.message, error.stack);
                console.warn('⚠️ Using fallback groupId: demo-group-id');
                setCurrentGroupId('demo-group-id');
                alert(`Error creating story group: ${error.message}\nUsing fallback group ID.`);
            } finally {
                setIsCreatingGroup(false);
            }
        };

        initializeGroup();
    }, [propGroupId, projectName]);
    */

    const handlePreview = () => {
        // Preview functionality - can be implemented based on your needs
        console.log('Preview clicked');
    };

    const handleSaveClick = async () => {
        if (!currentGroupId) {
            alert('No group ID available. Please wait for group creation to complete.');
            return;
        }

        console.log('🔵 [TOPBAR] Save button clicked!');
        console.log('🔵 [TOPBAR] Using groupId:', currentGroupId);
        setIsSaving(true);

        try {
            const result = await handleSave({
                store, // Pass store explicitly
                groupId: currentGroupId,
                slideId: slideId || null,
                slideMetadata: {
                    description: projectName || 'Created from Polotno Editor',
                    enableCTA: false,
                },
                onSuccess: (data) => {
                    console.log('✅ [TOPBAR] Save successful:', data);
                    alert('Slide saved successfully!');
                },
                onError: (error) => {
                    console.error('❌ [TOPBAR] Save failed:', error);
                    alert(`Failed to save: ${error}`);
                },
            });

            console.log('🔵 [TOPBAR] Save result:', result);
        } catch (error) {
            console.error('❌ [TOPBAR] Save error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
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
                    <span className="breadcrumb-item breadcrumb-current">
                        {projectName}
                    </span>
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



                    <button
                        className="topbar-btn topbar-btn-primary"
                        onClick={handleSaveClick}
                        disabled={isSaving || isCreatingGroup || !currentGroupId}
                        style={{ opacity: (isSaving || isCreatingGroup || !currentGroupId) ? 0.6 : 1 }}
                    >
                        {isSaving ? 'Saving...' : isCreatingGroup ? 'Preparing...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
});

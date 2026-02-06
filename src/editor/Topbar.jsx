import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import './Topbar.css';

import { ThemeToggleButton } from './ThemeToggleButton';
// Note: handleSave from canvasSave.js is deprecated
// We now use buildSlidePayload from slidePayloadBuilder.js (imported dynamically)
import { useEditorContext } from '../context/EditorContext';

export const Topbar = observer(({ store, projectName = 'Campaign Name', toolbar, groupId: propGroupId, slideId: propSlideId }) => {
    const [isSaving, setIsSaving] = useState(false);

    // Get context values (with fallback for when not in provider)
    let contextValues = {};
    try {
        contextValues = useEditorContext();
    } catch (e) {
        // Not in provider, use props
        contextValues = {
            currentGroupId: propGroupId,
            currentSlideId: propSlideId,
            checkIsHydrating: () => false,
            ctaState: {},
        };
    }

    const {
        currentGroupId: contextGroupId,
        currentSlideId: contextSlideId,
        checkIsHydrating,
        ctaState,
        groupSlides,
    } = contextValues;

    // Use context values with prop fallbacks
    const groupId = contextGroupId || propGroupId || 'demo-group-id';
    const slideId = contextSlideId || propSlideId;
    const [isCreatingGroup, _setIsCreatingGroup] = useState(false);

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
        // CRITICAL: Block save during hydration to prevent overwrite loops
        if (checkIsHydrating()) {
            console.warn('⚠️ [TOPBAR] Save blocked - hydration in progress');
            return;
        }

        if (!groupId) {
            alert('No group ID available. Please wait for group creation to complete.');
            return;
        }

        console.log('🔵 [TOPBAR] Save button clicked!');
        console.log('🔵 [TOPBAR] Using groupId:', groupId);
        console.log('🔵 [TOPBAR] Using slideId:', slideId);
        console.log('🔵 [TOPBAR] Editor State (ctaState):', ctaState);
        setIsSaving(true);

        try {
            // Import payload builder (NEVER reads from canvas export)
            // Import payload builder (NEVER reads from canvas export)
            const {
                buildSlidePayload,
                buildCreateSlideFormData,
                buildUpdateSlideFormData,
                calculateNextSlideOrder
            } = await import('../utils/slidePayloadBuilder.js');
            const { storyAPI } = await import('../services/api.js');

            // Get current page for element extraction
            const currentPage = store?.activePage || store?.pages?.[0] || null;

            if (!currentPage) {
                throw new Error('No active page to save');
            }

            // TARGETED SAVE STRATEGY
            // Save only the active/current slide (the one user is editing)
            // This ensures we don't overwrite other slides unnecessarily

            const pageIndex = store.pages.findIndex(p => p.id === currentPage.id);
            const order = pageIndex >= 0 ? pageIndex + 1 : 1;

            // Determine if this is an UPDATE or CREATE
            // page.custom.originalSlideId = backend ID set during hydration
            // If present, this is an existing slide -> UPDATE
            // If absent, this is a new slide -> CREATE
            const backendSlideId = currentPage.custom?.originalSlideId || null;
            const isUpdate = !!backendSlideId;

            console.log(`[TOPBAR] Save Mode: ${isUpdate ? 'UPDATE' : 'CREATE'}`);
            console.log(`[TOPBAR] Backend Slide ID: ${backendSlideId}`);
            console.log(`[TOPBAR] Page ID: ${currentPage.id}`);
            console.log(`[TOPBAR] Order: ${order}`);

            // Build Payload from editor state
            const payload = buildSlidePayload({
                editorState: ctaState || {},
                page: currentPage,
                groupId: groupId,
                slideId: backendSlideId, // Pass backend ID for update, null for create
                order: order,
            });

            console.log('📦 [TOPBAR] Payload:', payload);

            // Prepare Media Args with Dirty Tracking
            const mediaArgs = {
                image: (ctaState?.image instanceof File) ? ctaState.image : (ctaState?.imageFile instanceof File ? ctaState.imageFile : null),
                video: (ctaState?.video instanceof File) ? ctaState.video : (ctaState?.videoFile instanceof File ? ctaState.videoFile : null),
                imageChanged: !!ctaState?.imageChanged,
                videoChanged: !!ctaState?.videoChanged,
            };

            console.log('[TOPBAR] Media Args:', mediaArgs);

            let formData;
            let result;

            // Execute correct API based on slide type
            if (isUpdate) {
                // UPDATE: Strict dirty checking
                formData = buildUpdateSlideFormData(payload, mediaArgs);
                console.log('📤 [TOPBAR] Calling UPDATE endpoint for slide:', backendSlideId);
                result = await storyAPI.updateStorySlide(formData);
                console.log('✅ [TOPBAR] UPDATE successful:', result?.data);
            } else {
                // CREATE: Blind append (if media exists)
                formData = buildCreateSlideFormData(payload, mediaArgs);
                console.log('📤 [TOPBAR] Calling CREATE endpoint (new slide)');
                result = await storyAPI.createStorySlide(formData);
                console.log('✅ [TOPBAR] CREATE successful:', result?.data);

                // Store the new backend ID in page.custom for future updates
                if (result?.data?.id) {
                    currentPage.set({ custom: { ...currentPage.custom, originalSlideId: result.data.id } });
                    console.log('[TOPBAR] Stored new slide ID:', result.data.id);
                }
            }

            alert('Slide saved successfully!');

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
                        <span>Cancel</span>
                    </button>



                    <button
                        className="topbar-btn topbar-btn-primary"
                        onClick={handleSaveClick}
                        disabled={isSaving || isCreatingGroup || !groupId}
                        style={{ opacity: (isSaving || isCreatingGroup || !groupId) ? 0.6 : 1 }}
                    >
                        {isSaving ? 'Saving...' : isCreatingGroup ? 'Preparing...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
});

import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import './Topbar.css';

import { ThemeToggleButton } from './ThemeToggleButton';
// Note: handleSave from canvasSave.js is deprecated
// We now use buildSlidePayload from slidePayloadBuilder.js (imported dynamically)
import { useEditorContext } from '../context/EditorContext';
import Dropdown from '../components/shared/Dropdown';

export const Topbar = observer(({ store, projectName = 'Campaign Name', toolbar, groupId: propGroupId, slideId: propSlideId }) => {
    const [isSaving, setIsSaving] = useState(false);

    // Campaign name from context (real data)
    let campaignName = projectName;
    try {
        const context = useEditorContext();
        if (context && context.campaign && context.campaign.name) {
            campaignName = context.campaign.name;
        }
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
        // fallback to prop
    }

    // Get context values (with fallback for when not in provider)
    let contextValues = {};
    try {
        contextValues = useEditorContext();
    // eslint-disable-next-line no-unused-vars
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
        storyGroups,
        currentGroup,
        switchToGroup,
    } = contextValues;

    // Use context values with prop fallbacks
    const groupId = contextGroupId || propGroupId || 'demo-group-id';
    const slideId = contextSlideId || propSlideId;
    const [isCreatingGroup, _setIsCreatingGroup] = useState(false);

    const groupOptions = useMemo(() => {
        const groups = Array.isArray(storyGroups) ? storyGroups : [];

        const normalized = groups
            .filter((g) => g && g.id != null)
            .map((g) => ({
                id: String(g.id),
                name: g.name || g.title || `Group ${g.id}`,
                order: g.order,
                image:
                    g.thumbnail ||
                    g.image ||
                    g.icon ||
                    g.cover ||
                    g.preview ||
                    null,
                ringColor: g.ringColor || '#ccc',
                nameColor: g.nameColor || '#fff',
                isDummy: false,
            }));

        if (normalized.length > 0) return normalized;

        // Backend not connected yet -> show placeholders
        return [1, 2, 3, 4].map((i) => ({
            id: `dummy-group-${i}`,
            name: `Dummy Group ${i}`,
            image: null,
            isDummy: true,
        }));
    }, [storyGroups]);

    const currentGroupDisplay = useMemo(() => {
        const fromContext = currentGroup && currentGroup.id != null ? {
            id: String(currentGroup.id),
            name: currentGroup.name || currentGroup.title || `Group ${currentGroup.id}`,
            image:
                currentGroup.thumbnail ||
                currentGroup.image ||
                currentGroup.icon ||
                currentGroup.cover ||
                currentGroup.preview ||
                null,
            ringColor: currentGroup.ringColor || '#ccc',
            nameColor: currentGroup.nameColor || '#fff',
        } : null;

        if (fromContext) return fromContext;

        const fallbackId = (contextGroupId || propGroupId) ? String(contextGroupId || propGroupId) : null;
        if (fallbackId) {
            const found = groupOptions.find((g) => g.id === fallbackId);
            if (found) return found;
        }

        return null;
    }, [currentGroup, contextGroupId, propGroupId, groupOptions]);

    const dropdownOptions = useMemo(() => {
        return groupOptions.map((g) => ({
            value: g.id,
            label: g.order !== undefined && g.order !== null ? `(${g.order}) ${g.name}` : g.name,
            image: g.image,
            ringColor: g.ringColor,
            nameColor: g.nameColor,
            disabled: !!g.isDummy || typeof switchToGroup !== 'function',
        }));
    }, [groupOptions, switchToGroup]);

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
                buildUpdateSlideFormData            } = await import('../utils/slidePayloadBuilder.js');
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
                    <Dropdown
                        options={dropdownOptions}
                        value={currentGroupDisplay?.id}
                        placeholder="Select group"
                        ariaLabel="Switch Group"
                        panelMinWidth={240}
                        showOptionAvatar={true}
                        showOptionOrder={true}
                        onChange={(nextGroupId) => {
                            switchToGroup?.(nextGroupId);
                        }}
                        renderTrigger={() => (
                            <button
                                className="breadcrumb-group-selector"
                                title="Switch Group"
                                type="button"
                                style={{
                                    border: '2px solid #E0E0E0', // static neutral border
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    background: 'transparent',
                                }}
                            >
                                <div className="group-avatar-preview" style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {currentGroupDisplay?.image ? (
                                        <span style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${currentGroupDisplay?.ringColor || '#ccc'}` }}>
                                            <img
                                                src={currentGroupDisplay?.image}
                                                alt="Group"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                            />
                                        </span>
                                    ) : (
                                        <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: currentGroupDisplay?.ringColor || '#ccc', color: currentGroupDisplay?.nameColor || '#fff', fontWeight: 600, fontSize: 16, border: `2px solid ${currentGroupDisplay?.ringColor || '#ccc'}`, borderRadius: '50%' }}>
                                            {currentGroupDisplay?.name ? currentGroupDisplay.name.charAt(0).toUpperCase() : '?'}
                                        </span>
                                    )}
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
                        )}
                    />


                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-item breadcrumb-current">
                        {campaignName}
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
                    
                    {/* Preview Button with Custom SVG */}
                    <button 
                        className="topbar-btn topbar-btn-preview" 
                        onClick={() => {
                            // Lazy load and open preview modal
                            const event = new CustomEvent('openPreview', { detail: { store } });
                            window.dispatchEvent(event);
                        }}
                        title="Preview Story"
                    >
                        <svg width="103" height="36" viewBox="0 0 103 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <mask id="path-1-inside-1_5_951" fill="white">
                                <path d="M0 8C0 3.58172 3.58172 0 8 0H94.0859C98.5042 0 102.086 3.58172 102.086 8V28C102.086 32.4183 98.5042 36 94.0859 36H8C3.58172 36 0 32.4183 0 28V8Z"/>
                            </mask>
                            <path d="M0 8C0 3.58172 3.58172 0 8 0H94.0859C98.5042 0 102.086 3.58172 102.086 8V28C102.086 32.4183 98.5042 36 94.0859 36H8C3.58172 36 0 32.4183 0 28V8Z" fill="white"/>
                            <path d="M8 0V1H94.0859V0V-1H8V0ZM102.086 8H101.086V28H102.086H103.086V8H102.086ZM94.0859 36V35H8V36V37H94.0859V36ZM0 28H1V8H0H-1V28H0ZM8 36V35C4.13401 35 1 31.866 1 28H0H-1C-1 32.9706 3.02943 37 8 37V36ZM102.086 28H101.086C101.086 31.866 97.9519 35 94.0859 35V36V37C99.0565 37 103.086 32.9706 103.086 28H102.086ZM94.0859 0V1C97.9519 1 101.086 4.13401 101.086 8H102.086H103.086C103.086 3.02944 99.0565 -1 94.0859 -1V0ZM8 0V-1C3.02944 -1 -1 3.02944 -1 8H0H1C1 4.13401 4.13401 1 8 1V0Z" fill="black" fillOpacity="0.1" mask="url(#path-1-inside-1_5_951)"/>
                            <g clipPath="url(#clip0_5_951)">
                                <path d="M14.3747 18.232C14.3191 18.0823 14.3191 17.9177 14.3747 17.768C14.9158 16.4559 15.8344 15.334 17.0139 14.5446C18.1934 13.7552 19.5807 13.3337 21 13.3337C22.4193 13.3337 23.8067 13.7552 24.9862 14.5446C26.1657 15.334 27.0842 16.4559 27.6253 17.768C27.6809 17.9177 27.6809 18.0823 27.6253 18.232C27.0842 19.5441 26.1657 20.666 24.9862 21.4554C23.8067 22.2448 22.4193 22.6663 21 22.6663C19.5807 22.6663 18.1934 22.2448 17.0139 21.4554C15.8344 20.666 14.9158 19.5441 14.3747 18.232Z" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 20C22.1046 20 23 19.1046 23 18C23 16.8954 22.1046 16 21 16C19.8954 16 19 16.8954 19 18C19 19.1046 19.8954 20 21 20Z" stroke="#0A0A0A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <path d="M38.4575 23.5V13.3182H42.0867C42.8789 13.3182 43.5351 13.4624 44.0555 13.7507C44.5758 14.0391 44.9653 14.4335 45.2238 14.9339C45.4823 15.4311 45.6116 15.9912 45.6116 16.6143C45.6116 17.2408 45.4807 17.8042 45.2188 18.3047C44.9603 18.8018 44.5692 19.1963 44.0455 19.4879C43.5252 19.7763 42.8706 19.9205 42.0818 19.9205H39.586V18.6179H41.9426C42.443 18.6179 42.849 18.5317 43.1606 18.3594C43.4722 18.1837 43.7008 17.9451 43.8467 17.6435C43.9925 17.3419 44.0654 16.9988 44.0654 16.6143C44.0654 16.2299 43.9925 15.8885 43.8467 15.5902C43.7008 15.2919 43.4705 15.0582 43.1556 14.8892C42.8441 14.7202 42.4331 14.6357 41.9227 14.6357H39.9937V23.5H38.4575ZM47.1428 23.5V15.8636H48.5796V17.0767H48.6592C48.7984 16.6657 49.0436 16.3426 49.395 16.1072C49.7496 15.8686 50.1507 15.7493 50.5981 15.7493C50.6909 15.7493 50.8003 15.7526 50.9262 15.7592C51.0555 15.7659 51.1566 15.7741 51.2295 15.7841V17.206C51.1698 17.1894 51.0638 17.1712 50.9113 17.1513C50.7588 17.1281 50.6064 17.1165 50.4539 17.1165C50.1026 17.1165 49.7894 17.1911 49.5143 17.3402C49.2425 17.486 49.0271 17.6899 48.868 17.9517C48.7089 18.2102 48.6294 18.5052 48.6294 18.8366V23.5H47.1428ZM55.3833 23.6541C54.6309 23.6541 53.9829 23.4934 53.4394 23.1719C52.8991 22.8471 52.4815 22.3913 52.1865 21.8047C51.8949 21.2147 51.749 20.5237 51.749 19.7315C51.749 18.9493 51.8949 18.2599 52.1865 17.6634C52.4815 17.0668 52.8925 16.6011 53.4195 16.2663C53.9498 15.9316 54.5696 15.7642 55.2789 15.7642C55.7097 15.7642 56.1273 15.8355 56.5317 15.978C56.9361 16.1205 57.299 16.3442 57.6205 16.6491C57.942 16.9541 58.1955 17.3501 58.3811 17.8374C58.5667 18.3213 58.6595 18.9096 58.6595 19.6023V20.1293H52.5892V19.0156H57.2029C57.2029 18.6245 57.1233 18.2782 56.9642 17.9766C56.8051 17.6716 56.5814 17.4313 56.2931 17.2557C56.008 17.08 55.6733 16.9922 55.2888 16.9922C54.8712 16.9922 54.5066 17.0949 54.195 17.3004C53.8868 17.5026 53.6482 17.7678 53.4791 18.0959C53.3134 18.4207 53.2306 18.7737 53.2306 19.1548V20.0249C53.2306 20.5353 53.32 20.9695 53.499 21.3274C53.6813 21.6854 53.9349 21.9588 54.2597 22.1477C54.5845 22.3333 54.964 22.4261 55.3982 22.4261C55.6799 22.4261 55.9368 22.3864 56.1688 22.3068C56.4008 22.224 56.6013 22.1013 56.7703 21.9389C56.9394 21.7765 57.0686 21.576 57.1581 21.3374L58.5651 21.5909C58.4524 22.0052 58.2502 22.3681 57.9585 22.6797C57.6702 22.9879 57.3073 23.2282 56.8698 23.4006C56.4356 23.5696 55.9401 23.6541 55.3833 23.6541ZM66.4724 15.8636L63.7032 23.5H62.1123L59.3382 15.8636H60.934L62.868 21.7401H62.9475L64.8765 15.8636H66.4724ZM67.719 23.5V15.8636H69.2055V23.5H67.719ZM68.4697 14.6854C68.2112 14.6854 67.9891 14.5992 67.8035 14.4268C67.6212 14.2512 67.5301 14.0424 67.5301 13.8004C67.5301 13.5552 67.6212 13.3464 67.8035 13.174C67.9891 12.9983 68.2112 12.9105 68.4697 12.9105C68.7282 12.9105 68.9487 12.9983 69.1309 13.174C69.3166 13.3464 69.4094 13.5552 69.4094 13.8004C69.4094 14.0424 69.3166 14.2512 69.1309 14.4268C68.9487 14.5992 68.7282 14.6854 68.4697 14.6854ZM74.3461 23.6541C73.5938 23.6541 72.9458 23.4934 72.4023 23.1719C71.862 22.8471 71.4444 22.3913 71.1494 21.8047C70.8577 21.2147 70.7119 20.5237 70.7119 19.7315C70.7119 18.9493 70.8577 18.2599 71.1494 17.6634C71.4444 17.0668 71.8554 16.6011 72.3824 16.2663C72.9127 15.9316 73.5325 15.7642 74.2417 15.7642C74.6726 15.7642 75.0902 15.8355 75.4946 15.978C75.8989 16.1205 76.2619 16.3442 76.5834 16.6491C76.9049 16.9541 77.1584 17.3501 77.344 17.8374C77.5296 18.3213 77.6224 18.9096 77.6224 19.6023V20.1293H71.5521V19.0156H76.1657C76.1657 18.6245 76.0862 18.2782 75.9271 17.9766C75.768 17.6716 75.5443 17.4313 75.2559 17.2557C74.9709 17.08 74.6362 16.9922 74.2517 16.9922C73.8341 16.9922 73.4695 17.0949 73.1579 17.3004C72.8497 17.5026 72.6111 17.7678 72.442 18.0959C72.2763 18.4207 72.1934 18.7737 72.1934 19.1548V20.0249C72.1934 20.5353 72.2829 20.9695 72.4619 21.3274C72.6442 21.6854 72.8978 21.9588 73.2226 22.1477C73.5474 22.3333 73.9269 22.4261 74.3611 22.4261C74.6428 22.4261 74.8997 22.3864 75.1317 22.3068C75.3637 22.224 75.5642 22.1013 75.7332 21.9389C75.9023 21.7765 76.0315 21.576 76.121 21.3374L77.528 21.5909C77.4153 22.0052 77.2131 22.3681 76.9214 22.6797C76.6331 22.9879 76.2702 23.2282 75.8327 23.4006C75.3985 23.5696 74.903 23.6541 74.3461 23.6541ZM80.7632 23.5L78.5161 15.8636H80.0523L81.5487 21.4716H81.6233L83.1247 15.8636H84.661L86.1524 21.4467H86.227L87.7135 15.8636H89.2497L87.0075 23.5H85.4912L83.9401 17.9865H83.8257L82.2746 23.5H80.7632Z" fill="#0A0A0A"/>
                            <defs>
                                <clipPath id="clip0_5_951">
                                    <rect width="16" height="16" fill="white" transform="translate(13 10)"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </button>

                    <button className="topbar-btn topbar-btn-secondary" onClick={handlePreview}>
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

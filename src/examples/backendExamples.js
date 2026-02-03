/**
 * Example Usage of Story Campaign Backend Integration
 * This file demonstrates how to use the backend services
 */

import {
    storyService,
    setAuthTokens,
    createDefaultCampaign,
    createDefaultStoryGroup,
    createDefaultStorySlide,
    validateCampaign,
    buildCampaignPayload
} from './backend.js';

/**
 * Example 1: Authentication Setup
 */
async function setupAuthentication() {
    // After user logs in, store the tokens
    setAuthTokens({
        accessToken: 'your-access-token-here',
        refreshToken: 'your-refresh-token-here',
        accessExpiresAtMs: Date.now() + 3600000 // 1 hour from now
    });

    console.log('Authentication tokens stored');
}

/**
 * Example 2: Fetch All Campaigns
 */
async function fetchAllCampaigns() {
    const result = await storyService.getCampaigns({
        page: 1,
        limit: 10
    });

    if (result.success) {
        console.log('Campaigns:', result.data);
        console.log('Total count:', result.count);
    } else {
        console.error('Error fetching campaigns:', result.error);
    }
}

/**
 * Example 3: Create a New Campaign
 */
async function createNewCampaign() {
    // Validate campaign data first
    const campaignData = {
        name: 'Summer Sale 2024',
        screen: 'home_screen_id'
    };

    const validation = validateCampaign(campaignData);
    if (!validation.isValid) {
        console.error('Validation errors:', validation.errors);
        return;
    }

    // Create the campaign
    const result = await storyService.createCampaign(campaignData, {
        audience: '',
        isTimeBound: false,
        isAll: true
    });

    if (result.success) {
        console.log('Campaign created successfully!');
        console.log('Campaign ID:', result.campaignId);
        return result.campaignId;
    } else {
        console.error('Error creating campaign:', result.error);
    }
}

/**
 * Example 4: Create Story Group with Slides
 */
async function createStoryGroupWithSlides(campaignId, imageFiles) {
    // Define group styling
    const contentStyling = {
        storyGroupText: 'New Arrivals',
        ringColor: '#FF6633',
        nameColor: '#FF9933',
        thumbnailImage: imageFiles[0], // First image as thumbnail
        width: 60,
        ringStroke: 3,
        fontSize: 12,
        fontFamily: 'Medium',
        slideShowTime: 5,
        topLeftRadius: 30,
        topRightRadius: 30,
        bottomLeftRadius: 30,
        bottomRightRadius: 30
    };

    // Create slides
    const slides = imageFiles.map((file, index) => ({
        image: file,
        order: index + 1,
        isActive: true,
        enableCTA: true,
        ctaText: 'Shop Now',
        link: `https://example.com/product/${index + 1}`,
        description: `Product ${index + 1}`,
        cta_enabled: true,
        cta_text_color: '#FFFFFF',
        cta_background: '#F97316',
        cta_font_size: 14,
        cta_text_style: 'Arial',
        cta_alignment: 'center',
        cta_height: 40,
        cta_margin_top: 12,
        cta_margin_bottom: 12,
        cta_margin_left: 12,
        cta_margin_right: 12,
        cta_border_stroke: 2,
        cta_border_color: '#FFFFFF',
        cta_full_width: false,
        ctaWidth: 180,
        ctaCornerRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: 8,
            bottomRight: 8
        }
    }));

    // Create the group with slides
    const result = await storyService.createStoryGroup(
        campaignId,
        contentStyling,
        slides,
        {}, // formData for button customizations
        {}  // conditions
    );

    if (result.success) {
        console.log('Story group created successfully!');
        console.log('Group ID:', result.groupId);
        console.log('Slides created:', result.slides.length);
        return result.groupId;
    } else {
        console.error('Error creating story group:', result.error);
    }
}

/**
 * Example 5: Update a Story Group
 */
async function updateStoryGroup(groupId, campaignId) {
    const contentStyling = {
        storyGroupText: 'Updated Group Name',
        ringColor: '#00FF00',
        nameColor: '#0000FF',
        width: 70,
        ringStroke: 4
    };

    const result = await storyService.updateStoryGroup(
        groupId,
        campaignId,
        contentStyling,
        [], // slides (empty if not updating slides)
        {}  // formData
    );

    if (result.success) {
        console.log('Story group updated successfully!');
    } else {
        console.error('Error updating story group:', result.error);
    }
}

/**
 * Example 6: Create a Single Slide
 */
async function createSingleSlide(groupId, imageFile) {
    const slideData = {
        image: imageFile,
        isActive: true,
        enableCTA: true,
        button_text: 'Buy Now',
        link: 'https://example.com/buy',
        description: 'Amazing product',
        enableCrossButton: false,
        enableMuteButton: false,
        fullWidthCta: false,
        styling: {
            cta: {
                text: {
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontFamily: 'Arial',
                    fontDecoration: ['bold']
                },
                margin: {
                    top: 12,
                    left: 12,
                    right: 12,
                    bottom: 12
                },
                container: {
                    height: 40,
                    ctaWidth: 180,
                    alignment: 'center',
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    ctaFullWidth: false,
                    backgroundColor: '#F97316'
                },
                cornerRadius: {
                    topLeft: 8,
                    topRight: 8,
                    bottomLeft: 8,
                    bottomRight: 8
                }
            }
        }
    };

    const result = await storyService.createSlide(groupId, slideData, 1);

    if (result.success) {
        console.log('Slide created successfully!');
        console.log('Slide data:', result.data);
    } else {
        console.error('Error creating slide:', result.error);
    }
}

/**
 * Example 7: Update Campaign with Conditions
 */
async function updateCampaignWithConditions(campaignId) {
    const updates = {
        conditions: {
            conditions: [
                {
                    field: 'age',
                    operator: '>',
                    value: '18',
                    logical_operator: 'AND',
                    conditions: []
                },
                {
                    field: 'country',
                    operator: '==',
                    value: 'US',
                    logical_operator: 'AND',
                    conditions: []
                }
            ],
            logical_operator: 'AND'
        }
    };

    const result = await storyService.updateCampaign(campaignId, updates);

    if (result.success) {
        console.log('Campaign conditions updated successfully!');
    } else {
        console.error('Error updating campaign:', result.error);
    }
}

/**
 * Example 8: Get Campaign Analytics
 */
async function getCampaignAnalytics(campaignId) {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';

    const result = await storyService.getCampaignAnalytics(
        campaignId,
        startDate,
        endDate
    );

    if (result.success) {
        console.log('Analytics data:', result.data);
    } else {
        console.error('Error fetching analytics:', result.error);
    }
}

/**
 * Example 9: Toggle Campaign Status
 */
async function toggleCampaignStatus(campaignId) {
    const result = await storyService.toggleCampaignStatus(campaignId);

    if (result.success) {
        console.log('Campaign status toggled successfully!');
    } else {
        console.error('Error toggling campaign status:', result.error);
    }
}

/**
 * Example 10: Delete Campaign
 */
async function deleteCampaign(campaignId) {
    const result = await storyService.deleteCampaign(campaignId);

    if (result.success) {
        console.log('Campaign deleted successfully!');
    } else {
        console.error('Error deleting campaign:', result.error);
    }
}

/**
 * Example 11: Complete Workflow - Create Campaign with Multiple Groups
 */
async function completeWorkflowExample() {
    try {
        // Step 1: Create campaign
        console.log('Creating campaign...');
        const campaignResult = await storyService.createCampaign({
            name: 'Holiday Collection 2024',
            screen: 'home_screen'
        });

        if (!campaignResult.success) {
            throw new Error(campaignResult.error);
        }

        const campaignId = campaignResult.campaignId;
        console.log('Campaign created:', campaignId);

        // Step 2: Create first story group
        console.log('Creating first story group...');
        const group1Images = []; // Add your File objects here
        const group1Result = await createStoryGroupWithSlides(campaignId, group1Images);

        // Step 3: Create second story group
        console.log('Creating second story group...');
        const group2Images = []; // Add your File objects here
        const group2Result = await createStoryGroupWithSlides(campaignId, group2Images);

        // Step 4: Update campaign with conditions
        console.log('Adding targeting conditions...');
        await updateCampaignWithConditions(campaignId);

        // Step 5: Activate campaign
        console.log('Activating campaign...');
        await toggleCampaignStatus(campaignId);

        console.log('Complete workflow finished successfully!');
        console.log('Campaign ID:', campaignId);

    } catch (error) {
        console.error('Workflow failed:', error);
    }
}

/**
 * Example 12: Using Schema Helpers
 */
function usingSchemaHelpers() {
    // Create default campaign
    const campaign = createDefaultCampaign({
        name: 'My Campaign',
        screen: 'screen_id'
    });

    // Create default story group
    const group = createDefaultStoryGroup('campaign_id', {
        name: 'My Group',
        ringColor: '#FF0000'
    });

    // Create default story slide
    const slide = createDefaultStorySlide('group_id', 1, {
        image: null, // File object
        button_text: 'Click Me'
    });

    console.log('Default schemas created:', { campaign, group, slide });
}

// Export examples for use
export {
    setupAuthentication,
    fetchAllCampaigns,
    createNewCampaign,
    createStoryGroupWithSlides,
    updateStoryGroup,
    createSingleSlide,
    updateCampaignWithConditions,
    getCampaignAnalytics,
    toggleCampaignStatus,
    deleteCampaign,
    completeWorkflowExample,
    usingSchemaHelpers
};

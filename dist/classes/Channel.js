"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChannelCompact_1 = __importDefault(require("./ChannelCompact"));
const PlaylistCompact_1 = __importDefault(require("./PlaylistCompact"));
const Thumbnails_1 = __importDefault(require("./Thumbnails"));
const VideoCompact_1 = __importDefault(require("./VideoCompact"));
/**  Represents a Youtube Channel */
class Channel extends ChannelCompact_1.default {
    /** @hidden */
    constructor(channel = {}) {
        super();
        this.shelves = [];
        this.videos = [];
        this.playlists = [];
        Object.assign(this, channel);
    }
    /**
     * Load this instance with raw data from Youtube
     *
     * @hidden
     */
    load(data) {
        const { channelId, title, avatar, subscriberCountText, } = data.header.c4TabbedHeaderRenderer;
        this.id = channelId;
        this.name = title;
        this.thumbnails = new Thumbnails_1.default().load(avatar.thumbnails);
        this.videoCount = 0; // data not available
        this.subscriberCount = subscriberCountText.simpleText;
        this.videos = [];
        this.playlists = [];
        const { tvBanner, mobileBanner, banner } = data.header.c4TabbedHeaderRenderer;
        this.banner = new Thumbnails_1.default().load(banner.thumbnails);
        this.tvBanner = new Thumbnails_1.default().load(tvBanner.thumbnails);
        this.mobileBanner = new Thumbnails_1.default().load(mobileBanner.thumbnails);
        // shelves
        const rawShelves = data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
            .sectionListRenderer.contents;
        for (const rawShelf of rawShelves) {
            const shelfRenderer = rawShelf.itemSectionRenderer.contents[0].shelfRenderer;
            if (!shelfRenderer)
                continue;
            const { title, content, subtitle } = shelfRenderer;
            if (!content.horizontalListRenderer)
                continue;
            const items = content.horizontalListRenderer.items
                .map((i) => {
                if (i.gridVideoRenderer)
                    return new VideoCompact_1.default({ client: this.client }).load(i.gridVideoRenderer);
                if (i.gridPlaylistRenderer)
                    return new PlaylistCompact_1.default({ client: this.client }).load(i.gridPlaylistRenderer);
                if (i.gridChannelRenderer)
                    return new ChannelCompact_1.default({ client: this.client }).load(i.gridChannelRenderer);
                return undefined;
            })
                .filter((i) => i !== undefined);
            const shelf = {
                title: title.runs[0].text,
                subtitle: subtitle === null || subtitle === void 0 ? void 0 : subtitle.simpleText,
                items,
            };
            this.shelves.push(shelf);
        }
        return this;
    }
}
exports.default = Channel;

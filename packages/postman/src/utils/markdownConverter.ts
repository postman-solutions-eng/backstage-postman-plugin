const convertHtmlImageElementsToMarkdown = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = doc.getElementsByTagName('img');
    for (const img of Array.from(images)) {
        const alt = img.alt;
        const src = img.src;
        const markdownImage = `![${alt}](${src})`;
        img.replaceWith(markdownImage);
    }
    return doc.body.innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
};

export default convertHtmlImageElementsToMarkdown;
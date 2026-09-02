(() => {
  const replacementPool = [
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_1.jpg?v=1786711570', width: 2244, height: 2804 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_3.png?v=1786712209', width: 3366, height: 4206 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_4.png?v=1786712337', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_5.png?v=1786712684', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_6.png?v=1786712744', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_7.png?v=1786713012', width: 4344, height: 3258 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__EL_TLL_FRAME_73.jpg?v=1787222359', width: 1000, height: 1488 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__Editorial_Lookbok_The_Living_Book_FRAME_9.jpg?v=1786713204', width: 656, height: 1008 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/MELATO_ORIGINS26__TLB_CASABLANCA_ROOFTOP_001.jpg?v=1788085721', width: 1478, height: 1836 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/MELATO_ORIGINS26_-DRESS_TLB_CASABLANCA_001.jpg?v=1787782387', width: 2458, height: 3072 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/MELATO_ORIGINS26_DRESS-CODE-VIOLATION-RIBBED-POLO-MINI-DRESS_TLB_NOBU_MARRAKECH_001.jpg?v=1787782174', width: 796, height: 944 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_c3f8a453-e89f-49bb-a921-fd36edf5beed.png?v=1786713773', width: 4599, height: 3078 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__EL_TLL_FRAME_68.jpg?v=1787222251', width: 3069, height: 4611 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/MELATO_REDLIGHT26_TLL_OTTAWA_001.png?v=1788382746', width: 3366, height: 4206 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_58f42586-0d0f-4b45-9dba-348e896257d3.jpg?v=1786713771', width: 3366, height: 4206 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_7aa850a5-3d91-4325-9498-b0d5c77c6b84.png?v=1786713770', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_02f9a006-5424-44f5-b423-5ce4b7f81e8e.png?v=1786713770', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_0b9bc11d-8a44-4ec0-ad04-c5ccca5ee0ee.png?v=1786713770', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_56c3875c-24b0-40af-a689-37060153cb87.png?v=1786713770', width: 1024, height: 1536 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_3ab3c72d-2584-4f10-aa30-6bef215e3ac8.png?v=1786713773', width: 3072, height: 4608 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_a303dfae-8079-4310-877f-2e6691339cea.png?v=1786713773', width: 3918, height: 3612 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__EL_TLL_FRAME_66.jpg?v=1787152228', width: 668, height: 960 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_7c37299d-97eb-4fde-83f7-f4dc4c156053.png?v=1786713770', width: 1024, height: 1535 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_e73c1cb3-50e6-4939-a231-f379281b104c.png?v=1786713770', width: 1122, height: 1402 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_c829037c-e3e4-4061-acb0-2d5f0984064d.jpg?v=1786713770', width: 1086, height: 1448 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_5745f081-8fb0-4f28-b082-e22b66fd5ac4.jpg?v=1786713770', width: 1024, height: 1536 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_aab22eb9-b911-4ff8-8f47-1afb2db6022d.jpg?v=1786713770', width: 2244, height: 2804 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_174f488e-acc1-415b-95ed-b3157959c0ae.jpg?v=1786713770', width: 712, height: 912 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_b58a1244-8d27-49a7-92b8-37928ae8ce32.jpg?v=1786713770', width: 2172, height: 2896 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_e477d527-dd80-4e58-9355-e1c0d7d6249e.jpg?v=1786713771', width: 2172, height: 2896 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_2df65aca-9aed-4ac3-872d-31a59060cc56.jpg?v=1786713770', width: 1132, height: 884 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_34d4d671-e28a-4a54-8081-c1d6580bd48f.jpg?v=1786713770', width: 1012, height: 1008 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_534a4bfd-6490-4cc3-885f-989ff499e6a2.jpg?v=1786713770', width: 1064, height: 1008 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_63bb7395-6847-49b7-b869-283c92931394.jpg?v=1786713770', width: 2244, height: 2804 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_0319befe-44f4-47d7-9fa7-379ce50b98b3.jpg?v=1786713770', width: 1006, height: 1008 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_45a7370d-a8f6-404f-bc76-7b95185bfe6f.jpg?v=1786713770', width: 2244, height: 2804 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_3ddb1074-e917-45e1-b2ba-f3eccb2e7ad9.jpg?v=1786713770', width: 1140, height: 894 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/rn-image_picker_lib_temp_928214d3-7fef-4c98-8eda-c8b6c902db9e.jpg?v=1786713770', width: 2244, height: 2804 },
    { url: 'https://cdn.shopify.com/s/files/1/0809/3358/5151/files/Melato.ca__EL_TLL_FRAME_53.jpg?v=1787150205', width: 2048, height: 3072 }
  ];

  const targetSelector = '[data-evidence-archive] .mea__image-well img';
  let replacementCursor = 0;

  const withWidth = (url, width) => `${url}${url.includes('?') ? '&' : '?'}width=${width}`;

  const removeUnrecoverableCard = (img) => {
    const figure = img.closest('.mea__evidence');
    if (figure) figure.remove();
  };

  const applyReplacement = (img, replacement) => {
    const trigger = img.closest('[data-evidence-open]');
    const code = trigger?.dataset.evidenceCode || '';

    img.dataset.melatoRepairState = 'loading-replacement';
    img.width = replacement.width;
    img.height = replacement.height;
    img.alt = code
      ? `Melato Living Lookbook replacement evidence frame ${code}`
      : 'Melato Living Lookbook replacement evidence frame';
    img.srcset = `${withWidth(replacement.url, 480)} 480w, ${withWidth(replacement.url, 760)} 760w, ${withWidth(replacement.url, 1100)} 1100w`;
    img.src = withWidth(replacement.url, 760);

    if (trigger) {
      trigger.dataset.evidenceFull = withWidth(replacement.url, 2200);
    }

    img.addEventListener('load', () => {
      if (img.dataset.melatoRepairState === 'loading-replacement') {
        img.dataset.melatoRepairState = 'repaired';
      }
    }, { once: true });
  };

  const repairImage = (img) => {
    if (!(img instanceof HTMLImageElement) || !img.matches(targetSelector)) return;
    if (img.dataset.melatoRepairState === 'repaired') return;

    const replacement = replacementPool[replacementCursor++];
    if (!replacement) {
      removeUnrecoverableCard(img);
      return;
    }

    applyReplacement(img, replacement);
  };

  const scanAlreadyFailedImages = (scope = document) => {
    scope.querySelectorAll(targetSelector).forEach((img) => {
      if (img.complete && img.naturalWidth === 0) repairImage(img);
    });
  };

  document.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement && event.target.matches(targetSelector)) {
      repairImage(event.target);
    }
  }, true);

  scanAlreadyFailedImages();
  document.addEventListener('DOMContentLoaded', () => scanAlreadyFailedImages(), { once: true });
  document.addEventListener('shopify:section:load', (event) => scanAlreadyFailedImages(event.target));
})();

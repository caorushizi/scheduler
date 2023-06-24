import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import fs from "fs";
import path from "path";
import { CourseType, PrismaClient } from "@prisma/client";
import { normalizeUrl } from "./utils";

const prisma = new PrismaClient();

interface Course {
  cid: string;
  type: CourseType;
  title: string;
  link: string;
  poster: string;
  siteId: number;
}

async function getCourse(
  page: Page,
  course: ElementHandle<Element>
): Promise<Course | null> {
  const id = await page.evaluate((el) => el.getAttribute("data-cid"), course);
  const type = await course.$eval(
    ".info-box .title span",
    (el) => el.innerText
  );
  const title = await course.$eval(".info-box .title a", (el) => el.innerText);
  const link = await course.$eval(".info-box .title a", (el) =>
    el.getAttribute("href")
  );
  const poster = await course.$eval(".img-box img", (el) =>
    el.getAttribute("src")
  );

  let cType: CourseType = CourseType.FREE;
  if (type === "实战课") {
    cType = CourseType.COMBAT;
  } else if (type === "体系课") {
    cType = CourseType.PLAN;
  } else if (type === "微课") {
    cType = CourseType.MINI;
  }

  if (!id) {
    return null;
  }

  return {
    cid: id,
    type: cType,
    title,
    link: normalizeUrl(link),
    poster: normalizeUrl(poster),
    siteId: 1,
  };
}

async function insert(course: Course) {
  const result = await prisma.course.upsert({
    where: { cid: course.cid },
    update: course,
    create: course,
  });

  return result;
}

async function getPageWithCookie(browser: Browser) {
  const page = await browser.newPage();

  // 加载cookie并访问受保护的页面
  const cookiePath = path.join(__dirname, "../cookies/imooc.json");
  const savedCookies = JSON.parse(fs.readFileSync(cookiePath, "utf8"));
  await page.setCookie(...savedCookies);

  return page;
}

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const authPage = await getPageWithCookie(browser);

  let pageNum = 1;
  while (pageNum < 100) {
    console.log("正在爬取第", pageNum, "页");
    await authPage.goto(
      `https://www.imooc.com/u/index/allcourses?page=${pageNum}`
    );
    const courses = await authPage.$$(".courseitem.tl-item ");

    if (courses.length === 0) {
      break;
    }

    for (const course of courses) {
      const data = await getCourse(authPage, course);
      if (!data) {
        continue;
      }

      const result = await insert(data);
      console.log("课程", result.title, "插入成功");
    }
    pageNum++;
  }

  await browser.close();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { HttpAuthService } from "@backstage/backend-plugin-api";
import express from "express";
import Router from "express-promise-router";
import { Request, Response } from "express";
import { PostmanService } from "./services/postman";

export interface RouterOptions {
  httpAuth: HttpAuthService;
  postmanService: PostmanService;
}

export async function createRouter({
  postmanService,
}: RouterOptions): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.use(async (_req, res, next) => {
    if (res.statusCode === 401) {
      res.status(401).json({ error: "No API key provided" });
    } else {
      next();
    }
  });

  router.get("/health", (_req, res) => {
    res.send("OK");
  });

  // Example route: Get API by ID
  router.get("/apis/:id", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIData(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get API versions
  router.get("/apis/:id/versions", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIVersions(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get API version by ID
  router.get(
    "/apis/:id/versions/:versionId",
    async (req: Request, res: Response) => {
      try {
        const data = await postmanService.getPostmanAPIVersion(
          req.params.id,
          req.params.versionId,
        );
        res.json(data);
      } catch (error: any) {
        res.status(error.response?.status || 500).json({
          error: error.message,
          status: error.response?.status,
        });
      }
    },
  );

  // Get all monitors, optionally filtered by workspace
  router.get("/monitors", async (req: Request, res: Response) => {
    try {
      const workspace = req.query.workspace
        ? req.query.workspace.toString()
        : "";
      const data = await postmanService.getAllPostmanMonitorsData(workspace);
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get monitor by ID
  router.get("/monitors/:id", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanAPIMonitorData(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get all monitors by workspace ID
  router.get("/monitors/:workspaceId", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getAllPostmanMonitorsData(
        req.params.workspaceId,
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get collection by ID
  router.get("/collections/:id", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanCollection(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get collections by tag
  router.get("/tags/:tag/entities", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanCollectionsByTag(
        req.params.tag,
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get all collection tags
  router.get("/collections/:id/tags", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getCollectionTags(
        req.params.id,
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Set collection tags
  router.put("/collections/:id/tags", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.setCollectionTags(
        req.params.id,
        req.body.data
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get Collection Linker Status
  router.get("/collectionlinker/status", async (_req: Request, res: Response) => {
    try {
      const data = await postmanService.getCollectionLinkerStatus();
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get users
  router.get("/users", async (_req: Request, res: Response) => {
    try {
      const { data } = await postmanService.getAllPostmanUsers();
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get workspaces
  router.get("/workspaces", async (_req: Request, res: Response) => {
    try {
      const data = await postmanService.getAllPostmanWorkspaces();
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get a single workspace by ID
  router.get("/workspace/:workspaceId", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanWorkspace(
        req.params.workspaceId,
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get a single workspace by ID
  router.get("/workspace/:workspaceId", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getPostmanWorkspace(
        req.params.workspaceId,
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  // Get collections by workspace ID
  router.get("/collections", async (req: Request, res: Response) => {
    try {
      const data = await postmanService.getAllPostmanCollections(
        req?.query?.workspace?.toString() || "",
      );
      res.json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json({
        error: error.message,
        status: error.response?.status,
      });
    }
  });

  return router;
}
